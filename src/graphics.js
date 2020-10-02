import chroma from "chroma-js";
import * as PIXI from "pixi.js";
PIXI.utils.skipHello();

import {Matrix} from "./matrix.js";

class Graphics extends PIXI.Graphics {
    constructor() {
        super();
        this.ctm = new Matrix(); // cpntext translation matrix; grabbed from cairo
        this._contexts = [];
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
        cap = _setDefault(cap, PIXI.LINE_CAP.BUTT);
        join = _setDefault(join, PIXI.LINE_JOIN.MITER);
        miterLimit = _setDefault(miterLimit, 10);

        if (typeof color != "number") {
            // PIXI wants hex, we give it hex
            [color, alpha] = parseColor(color, alpha);
        }
        super.lineStyle({width, color, alpha, alignment, native, cap, join, miterLimit});
    }

    beginFill(color, alpha) {
        if (typeof color != "number") {
            // PIXI wants hex, we give it hex
            [color, alpha] = parseColor(color, alpha);
        }
        super.beginFill(color, alpha);
    }

    // translated funcs (ones that recalc the points straight away, based on the current matrix)
    // XXX - add any others that need translating. e.g. arcTo
    moveTo(x, y) {
        super.moveTo(...this.ctm.apply(x, y));
        this.currentPath.transformed = true;
    }

    lineTo(x, y) {
        super.lineTo(...this.ctm.apply(x, y));
    }

    arc(cx, cy, radius, startAngle, endAngle, anticlockwise) {
        super.arc(...this.ctm.apply(cx, cy), radius, startAngle, endAngle, anticlockwise);
    }

    arcTo(x1, y1, x2, y2, radius) {
        super.arcTo(...this.ctm.apply(x1, y1), ...this.ctm.apply(x2, y2), radius);
    }

    bezierCurveTo(cpX, cpY, cpX2, cpY2, toX, toY) {
        super.bezierCurveTo(...this.ctm.apply(cpX, cpY), ...this.ctm.apply(cpX2, cpY2), ...this.ctm.apply(toX, toY));
    }

    // context matrix transformations
    translate(x, y) {
        this.ctm.translate(x, y);
    }
    rotate(rad) {
        this.ctm.rotate(rad);
    }
    scale(x, y) {
        this.ctm.scale(x, y);
    }

    skew(x, y) {
        this.ctm.skew(x, y);
    }

    drawShape(shape) {
        // overriding graphics drawShape so that we can feed it in our own transformation matrix
        let matrix = new PIXI.Matrix();
        if (shape.transformed) {
            // the interactive drawing bits that can have transforms in between will be translated on the fly
            // so that you can have moveto -> rotate -> lineto -> rotate etc.
            // in that case we don't need double the transform
        } else {
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
    }

    restore() {
        this.finishPoly();
        this.ctm = new Matrix(this._contexts.splice(this._contexts.length - 1, 1)[0]);
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
