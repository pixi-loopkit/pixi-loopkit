import chroma from "chroma-js";
import {Graphics as PixiGraphics, LINE_CAP, LINE_JOIN, Matrix as PixiMatrix, utils as PixiUtils} from "pixi.js";

import {Matrix} from "./matrix.js";

class Graphics extends PixiGraphics {
    constructor() {
        super();
        this.ctm = new Matrix(); // context translation matrix; grabbed from cairo
        this._ctmTransformed = false;
        this._contexts = [];
        this.bounds = null;
    }

    addChild(...child) {
        // filter out nulls
        child = child.filter(ch => ch);
        if (child.length) {
            super.addChild(...child);
        }
    }

    lineStyle(width, color, alpha, alignment, native, cap, join, miterLimit) {
        if (typeof width != "number") {
            // we have ourselves an options object rather than a full listing
            ({width, color, alpha, alignment, native, cap, join, miterLimit} = width);
        }
        width = _setDefault(width, 0);
        color = _setDefault(color, 0);
        alpha = _setDefault(alpha, 1);
        alignment = _setDefault(alignment, 0.5);
        native = _setDefault(native, false);
        cap = _setDefault(cap, LINE_CAP.BUTT);
        join = _setDefault(join, LINE_JOIN.MITER);
        miterLimit = _setDefault(miterLimit, 10);

        if (typeof color != "number") {
            // PIXI wants hex, we give it hex
            [color, alpha] = parseColor(color, alpha);
        }
        return super.lineStyle({width, color, alpha, alignment, native, cap, join, miterLimit});
    }

    beginFill(color, alpha) {
        if (typeof color != "number") {
            // PIXI wants hex, we give it hex
            [color, alpha] = parseColor(color, alpha);
        }
        return super.beginFill(color, alpha);
    }

    // translated funcs (ones that recalc the points straight away, based on the current matrix)
    // XXX - add any others that need translating. e.g. arcTo
    moveTo(x, y) {
        super.moveTo(...this.ctm.apply(x, y));
        this.currentPath.transformed = true;
        return this;
    }

    lineTo(x, y) {
        return super.lineTo(...this.ctm.apply(x, y));
    }

    arc(cx, cy, radius, startAngle, endAngle, anticlockwise) {
        return super.arc(...this.ctm.apply(cx, cy), radius, startAngle, endAngle, anticlockwise);
    }

    arcTo(x1, y1, x2, y2, radius) {
        return super.arcTo(...this.ctm.apply(x1, y1), ...this.ctm.apply(x2, y2), radius);
    }

    bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
        return super.bezierCurveTo(
            ...this.ctm.apply(cpX, cpY),
            ...this.ctm.apply(cpX2, cpY2),
            ...this.ctm.apply(toX, toY)
        );
    }

    // context matrix transformations
    translate(x, y) {
        this.ctm.translate(x, y);
        this._ctmTransformed = true;
        return this;
    }
    rotate(rad) {
        this.ctm.rotate(rad);
        this._ctmTransformed = true;
        return this;
    }

    doScale(x, y) {
        // the matrix operations ended up clashing with the `scale` property on graphics; what a mess
        this.ctm.scale(x, y);
        this._ctmTransformed = true;
        return this;
    }

    doSkew(x, y) {
        // the matrix operations ended up clashing with the `skew` property on graphics; what a mess
        this.ctm.skew(x, y);
        this._ctmTransformed = true;
        return this;
    }

    drawShape(shape) {
        // overriding graphics drawShape so that we can feed it in our own transformation matrix
        let matrix = null;
        if (shape.transformed || !this._ctmTransformed) {
            // the interactive drawing bits that can have transforms in between will be translated on the fly
            // so that you can have moveto -> rotate -> lineto -> rotate etc.
            // in that case we don't need double the transform
        } else {
            matrix = new PixiMatrix();
            matrix.set(...this.ctm.toArray());
        }
        if (!this._holeMode) {
            this._geometry.drawShape(shape, this._fillStyle.clone(), this._lineStyle.clone(), matrix);
        } else {
            this._geometry.drawHole(shape, matrix);
        }
        return this;
    }

    save() {
        this._contexts.push(new Matrix(this.ctm));
        return this;
    }

    restore() {
        this.finishPoly();
        this.ctm = new Matrix(this._contexts.splice(this._contexts.length - 1, 1)[0]);
        return this;
    }

    calculateBounds() {
        // allow specifying bounds manually. use with caution and for containers that do not move around
        // as if you crop it too conservatively and then move the parent, an out-of-view portion might
        // get on the screen and not being rendered
        if (this.bounds) {
            this._bounds.clear();
            this._bounds.addBounds({
                minX: this.bounds.x1 || this.bounds.minX || 0,
                maxX: this.bounds.x2 || this.bounds.maxX || 0,
                minY: this.bounds.y1 || this.bounds.minY || 0,
                maxY: this.bounds.y2 || this.bounds.maxY || 0,
            });
            this._bounds.updateID = this._boundsID;
        } else {
            super.calculateBounds();
        }
    }
}

function _setDefault(val, def) {
    return val !== undefined ? val : def;
}

function parseColor(color, alpha) {
    if (!color._rgb) {
        // cast color to chroma.Color only if it's not already that
        // we need to duck-type as chroma is caching Color objects as plain objects and so instanceof fails
        color = chroma(color);
    }
    alpha = alpha != undefined ? alpha : color.alpha();
    return [color.num(), alpha];
}

export {Graphics, parseColor};
