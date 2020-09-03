import {Easing} from "./easing.js";
import {Circular, RadialCluster} from "./layout.js";
import {Loop} from "./loop.js";
import {LoopKit} from "./loopkit.js";
import {Props, scale} from "./props.js";

export {Easing, Loop, LoopKit, Props};
export {Circular, RadialCluster};
export {scale};

import chroma from "chroma-js";
let hexColor = color => chroma(color).num();
export {hexColor};
