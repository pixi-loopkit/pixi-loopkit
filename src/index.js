import chroma from "chroma-js";

import {Props, scale} from "./props.js";
import {Loop} from "./loop.js";
import {LoopKit} from "./loopkit.js";

export {LoopKit, Props, Loop};
export {scale};

// in case you want everything under the same namespace
const loopkit = {LoopKit, Props, Loop, scale};
export default {loopkit};


let hexColor = color => chroma(color).num();
export {hexColor}
