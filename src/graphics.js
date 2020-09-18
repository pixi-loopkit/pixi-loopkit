import chroma from "chroma-js";
import * as PIXI from "pixi.js";
PIXI.utils.skipHello();

class Graphics extends PIXI.Graphics {
    constructor() {
        super();
    }

    lineStyle(width, color, alpha, alignment, native, cap, join, miterLimit) {
        if (typeof width != "number") {
            // we have ourselves an options object rather than a full listing
            ({width, color, alpha, alignment, native, cap, join, miterLimit} = width);
        }
        width = setDefault(width, 0);
        color = setDefault(color, 0);
        alpha = setDefault(alpha, 1);
        alignment = setDefault(alignment, 0.5);
        native = setDefault(native, false);
        cap = setDefault(cap, PIXI.LINE_CAP.BUTT);
        join = setDefault(join, PIXI.LINE_JOIN.MITER);
        miterLimit = setDefault(miterLimit, 10);

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
}

function setDefault(val, def) {
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

export {Graphics};
