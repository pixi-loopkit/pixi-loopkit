import {Easing} from "./easing.js";
import {Loop} from "./loop.js";
import {LoopKit} from "./loopkit.js";
import {Props, scale} from "./props.js";

export {Easing, Loop, LoopKit, Props};
export {scale};

// in case you want everything under the same namespace
const loopkit = {LoopKit, Props, Loop, scale};
export default {loopkit};


import chroma from "chroma-js";
let hexColor = color => chroma(color).num();
export {hexColor}
