import * as BezierEasing from "bezier-easing";

function symmetrical(name, easeIn, easeOut) {
    // easeOut is inverse of easeIn, and easeInOut is half way ease-in and half way ease out
    // no need to pretend it's something else
    let inverse = func => t => 1 - func(1 - t);

    easeIn = easeIn || inverse(easeOut);
    easeOut = easeOut || inverse(easeIn);

    return {
        [`${name}In`]: easeIn,
        [`${name}Out`]: easeOut,
        [`${name}InOut`]: t => (t < 0.5 ? easeIn(t * 2) / 2 : easeOut(t * 2 - 1) / 2 + 0.5),
    };
}

const Easing = {
    linear: t => t,

    // Bezier's roll your own + a few snatched from material design docs
    bezier: (p1x, p1y, p2x, p2y) => BezierEasing(p1x, p1y, p2x, p2y),
    material: t => BezierEasing(0.4, 0, 0.2, 1)(t),
    materialDecelerated: t => BezierEasing(0, 0, 0.2, 1)(t),
    materialAccelerated: t => BezierEasing(0.4, 0, 1, 1)(t),

    // Penner classic
    ...symmetrical("quad", t => Math.pow(t, 2)),
    ...symmetrical("cubic", t => Math.pow(t, 3)),
    ...symmetrical("quart", t => Math.pow(t, 4)),
    ...symmetrical("quint", t => Math.pow(t, 5)),
    ...symmetrical("sine", t => 1 - Math.cos((t * Math.PI) / 2)),
    ...symmetrical("expo", t => (t = 0 ? 0 : Math.pow(2, 10 * t - 10))),
    ...symmetrical("circ", t => 1 - Math.sqrt(1 - Math.pow(t, 2))),
    ...symmetrical("back", t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return c3 * Math.pow(t, 3) - c1 * Math.pow(t, 2);
    }),
    ...symmetrical("elastic", t => {
        const c4 = (2 * Math.PI) / 3;
        return t == 0 || t == 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }),
    ...symmetrical("bounce", null, t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }),
};

export {Easing};
