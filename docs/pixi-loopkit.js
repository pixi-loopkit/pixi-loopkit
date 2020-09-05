/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

function LinearEasing (x) {
  return x;
}

module.exports = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  for (var i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "Easing", function() { return /* reexport */ Easing; });
__webpack_require__.d(__webpack_exports__, "Loop", function() { return /* reexport */ Loop; });
__webpack_require__.d(__webpack_exports__, "LoopKit", function() { return /* reexport */ loopkit_LoopKit; });
__webpack_require__.d(__webpack_exports__, "Props", function() { return /* reexport */ Props; });
__webpack_require__.d(__webpack_exports__, "Circular", function() { return /* reexport */ Circular; });
__webpack_require__.d(__webpack_exports__, "RadialCluster", function() { return /* reexport */ RadialCluster; });
__webpack_require__.d(__webpack_exports__, "scale", function() { return /* reexport */ scale; });
__webpack_require__.d(__webpack_exports__, "hexColor", function() { return /* binding */ hexColor; });

// EXTERNAL MODULE: ./node_modules/bezier-easing/src/index.js
var src = __webpack_require__(0);

// CONCATENATED MODULE: ./src/easing.js


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
    bezier: (p1x, p1y, p2x, p2y) => src(p1x, p1y, p2x, p2y),
    material: t => src(0.4, 0, 0.2, 1)(t),
    materialDecelerated: t => src(0, 0, 0.2, 1)(t),
    materialAccelerated: t => src(0.4, 0, 1, 1)(t),

    // Penner classic
    ...symmetrical("quad", t => Math.pow(t, 2)),
    ...symmetrical("cubic", t => Math.pow(t, 3)),
    ...symmetrical("quart", t => Math.pow(t, 4)),
    ...symmetrical("quint", t => Math.pow(t, 5)),
    ...symmetrical("sine", t => 1 - Math.cos((t * Math.PI) / 2)),
    ...symmetrical("expo", t => (t = 0 ? undefined : Math.pow(2, 10 * t - 10))),
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



// CONCATENATED MODULE: ./src/layout.js
class RadialCluster {
    constructor({x, y, rotation, angle, spacing, innerRadius, rotateNodes}) {
        this.x = x || 0;
        this.y = y || 0;
        this.rotation = rotation || 0;
        this.angle = angle == undefined ? angle : 360;
        this.spacing = spacing || 20;
        this.innerRadius = innerRadius == undefined ? this.spacing : innerRadius;
        this.rotateNodes = rotateNodes;
    }

    position(nodes) {
        let maxAngle = this.angle / 2;
        let spacing = this.spacing;

        let distance = this.innerRadius;
        let angle = -maxAngle;

        function itemsOnLine(distance) {
            let l = (distance * 2 * Math.PI * props.spread) / 360;
            let items = l / spacing;
            return Math.round(items);
        }

        let items = itemsOnLine(distance);

        let i = 0;
        nodes.forEach(node => {
            angle = -props.spread / 2 + (i / items) * props.spread;

            node.x = this.x - Math.sin(rad(angle)) * distance;
            node.y = this.y - Math.cos(rad(angle)) * distance;

            if (this.rotateNodes) {
                node.rotation = rad(-angle);
            }

            if (i >= items) {
                i = 0;
                distance += spacing;
                angle = -maxAngle;
                items = itemsOnLine(distance);
            } else {
                i += 1;
            }
        });
    }
}

class Circular {
    constructor({x, y, r, spacing, angle, rotation, rotateNodes}) {
        this.x = x;
        this.y = y;
        this.spacing = spacing;
        this.r = r;
        this.rotation = rotation || 0;
        this.angle = angle == undefined ? 360 : angle; // 0..360
        this.rotateNodes = rotateNodes;
    }

    update(params) {
        Object.entries(params).forEach(([key, val]) => {
            this[key] = val;
        });
    }

    position(nodes) {
        // lay out the nodes
        let angleIncrement = this.angle / nodes.length;

        let [x, y] = [this.x, this.y];

        // you can specify either radius or spacing, and we'll figure out the distance from there;
        let distance;
        let r = this.r;
        if (this.r) {
            let lineLength = this.r * Math.PI * 2;
            distance = (lineLength / nodes.length) * (this.angle / 360);
        } else {
            distance = this.spacing;
            r = (this.spacing * nodes.length) / (Math.PI * 2); // / (this.angle / 360);
        }

        let degrees = this.rotation;

        // center before we start going around; there is bit of voodoo going on here that could use a longer
        // docstring
        x = x + Math.sin(rad(degrees)) * r + Math.sin(rad(degrees + 90)) * distance / 2;
        y = y + Math.cos(rad(degrees)) * r + Math.cos(rad(degrees + 90)) * distance / 2;


        nodes.forEach((node, idx) => {
            [node.x, node.y] = [x, y];
            if (this.rotateNodes) {
                node.rotation = rad(-degrees);
            }
            degrees = degrees + angleIncrement;
            x = x - Math.sin(rad(degrees - 90)) * distance;
            y = y - Math.cos(rad(degrees - 90)) * distance;
        });
    }
}

function rad(deg) {
    return (deg * Math.PI) / 180;
}



// CONCATENATED MODULE: ./src/loop.js
class Loop {
    constructor(frames = 120) {
        this._frames = frames;
        this.frameFull = 0; // goes from 0 to frames
    }

    get frames() {
        return this._frames;
    }

    set frames(frames) {
        // when duration of loop is changed on the fly, we try to stay roughly in the same place
        let frame = this.frame;
        this._frames = frames;
        this.frameFull = Math.floor(frames * frame);
    }

    get norm() {
        return this.frameFull / this._frames;
    }

    get frame() {
        return this.norm;
    }

    zig(times = 2) {
        // splits frame's 0->1 into 0->1->0->1->0->1, N times.
        // times=1 matches input, times=2 will render 0->1->0, times=3 will render 0->1->0->1, etc
        let frame = this.norm;
        let a = Math.floor(frame * times) % 2;
        let b = frame % (1 / times);
        return Math.abs(a - b * times);
    }

    zigzag(times = 1) {
        // zig and zag back, which means you always end back to where you started 0->1->0. equals to zig(2)
        return this.zig(times * 2);
    }

    fullCycle(callback) {
        // cycles through the full loop and makes sure we are not missing any frames, nor we do have any extra
        for (let frameFull = 0; frameFull < this.frames; frameFull++) {
            this.frameFull = frameFull;
            callback(this.frame, this.frameFull);
        }
    }

    splitFrame(parts) {
        let res = [];
        for (let part = 0; part < parts; part++) {
            let actionFrame = Math.min(Math.max(this.frame - (1 / parts) * part, 0) * parts, 1);
            res.push(actionFrame);
        }
        return res;
    }

    delay(frames) {
        return (Math.abs(this.frameFull - frames) % this.frames) / this.frames;
    }

    tick(frames) {
        let nextFrame = this.frameFull + (frames || 1);
        // while normally you'd loop 0..last, we loop 0..last-1 as the final frame should be the same as first frame
        let totalFrames = this.frames - 1;
        this.frameFull = (totalFrames + nextFrame) % totalFrames;
    }
}



// CONCATENATED MODULE: ./src/loopkit.js

let PIXI = {};
try {
    PIXI = __webpack_require__(3);
} catch (e) {
    // on serverside rendering, rather than dying gracefully, pixi will explode as it tries to access window
    console.log("Failed to import PIXI somehow. You're on your own!");
}

class loopkit_LoopKit {
    constructor({container, onFrame, antialias, bgColor, frames, debugKeystrokes, stillsOpacity}) {
        container = typeof container == "string" ? document.querySelector(container) : container;
        this.container = container;
        this.width = 0;
        this.height = 0;
        this.loop = new Loop(frames || 60);
        this.debugKeystrokes = debugKeystrokes === undefined ? true : debugKeystrokes;
        this.stillsOpacity = stillsOpacity || 0.2;

        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);

        this.renderer = new PIXI.Renderer({
            view: this.canvas,
            antialias: antialias !== undefined ? antialias : true,
            resolution: window.devicePixelRatio,
            autoDensity: true,

            // want these for generating stills
            clearBeforeRender: false,
            preserveDrawingBuffer: true,
        });

        this._root = new PIXI.Container();
        this.bg = new PIXI.Graphics();
        if (bgColor) {
            this.bgColor = hexColor(bgColor);
            this._root.addChild(this.bg);
        }
        this.graphics = new PIXI.Graphics();
        this._root.addChild(this.graphics);

        // bind the callback funcs so they don't lose our context
        // the behavior can be overridden on the API caller side by using an arrow function
        this.onKeyDown = this.onKeyDown.bind(this);
        this._onFrame = this._onFrame.bind(this);
        this._setDimensions = this._setDimensions.bind(this);

        this._connectListeners(true);

        this._renderPending = null;

        this.ticker = PIXI.Ticker.shared;
        this.ticker.add(this._onFrame);
        this.ticker.stop();
        this._setDimensions();

        if (onFrame) {
            this.onFrame = onFrame.bind(this);
            this.ticker.start();
        }
    }

    _onFrame(tick) {
        if (!this.onFrame) {
            // nothing to do if there is no callback
            return;
        }
        if (tick !== false) {
            this.loop.tick();
        }
        this.onFrame(this.graphics, this.loop.frame);
        this.renderer.render(this._root);
    }

    render() {
        // manual call to render the screen in case we are not looping right now
        if (this.ticker.started) {
            // ignore as we are auto-rendering in _onFrame
            return;
        }

        window.cancelAnimationFrame(this._renderPending);
        this._renderPending = window.requestAnimationFrame(() => {
            if (this.onFrame) {
                this.onFrame(this.graphics, this.loop.frame);
            }
            this.renderer.render(this._root);
        });
    }

    start() {
        if (!this.onFrame) {
            // no point to tick if nobody's listening
            return;
        }
        this.ticker.start();
    }
    stop() {
        this.ticker.stop();
    }
    pause(pause) {
        pause = pause === undefined ? this.ticker.started : pause;
        pause ? this.stop() : this.start();
    }

    addChild(...child) {
        this.graphics.addChild(...child);
    }
    removeChild(child) {
        this.graphics.removeChild(child);
    }
    children() {
        return this.graphics.children;
    }

    _setDimensions(evt) {
        let box = this.canvas.parentElement.getBoundingClientRect();
        [this.width, this.height] = [box.width, box.height];
        this.canvas.style.width = this.width;
        this.canvas.style.height = this.height;
        this.renderer.resize(box.width, box.height);

        if (this.bgColor) {
            this.bg.clear();
            this.bg.beginFill(this.bgColor);
            this.bg.drawRect(0, 0, this.width, this.height);
            this.bg.endFill();
        }

        this.render();
    }

    splitFrame(parts) {
        // proxy for easier access - returns current frame split into N even parts
        // 0..1 of the frame turns into [0..1, 0..1, ...]
        // e.g. 2 parts for frame 0.6 will return [1, 0.2]  <-- first part done, second 20% in;
        return this.loop.splitFrame(parts);
    }

    export(filename, resolution = 2) {
        let renderTexture = PIXI.RenderTexture.create({
            width: this.width,
            height: this.height,
            resolution,
        });
        this.renderer.render(this._root, renderTexture, false);

        let objectURL = this.renderer.plugins.extract.base64(renderTexture, "image/png", 1);

        let element = document.createElement("a");
        element.setAttribute("href", objectURL);
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(objectURL);
    }

    exportLoop() {
        this.stop();
        this.loop.frameFull = 0;
        this.loop.fullCycle((frame, idx) => {
            this._onFrame(false);
            let paddedIdx = ("0000" + idx).slice(-4);
            this.export(`frame-${paddedIdx}.png`);
        });
    }

    exportStill(filename) {
        // renders all frames on the canvas and then exports the render for a still
        let renderTexture = PIXI.RenderTexture.create({
            width: this.width,
            height: this.height,
            resolution: 2,
        });

        this.stop();
        this.loop.frameFull = 0;
        this.graphics.alpha = this.stillsOpacity;
        this.loop.fullCycle((frame, idx) => {
            this._onFrame(false);
            this.bg.visible = idx == 0; // we want our smear, so disable background after first frame
            this.renderer.render(this._root, renderTexture, false);
        });
        this.graphics.alpha = 1;
        this.bg.visible = true;

        if (filename) {
            let objectURL = this.renderer.plugins.extract.base64(renderTexture, "image/png", 1);
            let element = document.createElement("a");
            element.setAttribute("href", objectURL);
            element.setAttribute("download", filename);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            URL.revokeObjectURL(objectURL);
        }
    }

    onKeyDown(evt) {
        if (evt.key == " ") {
            this.pause();
        } else if (evt.code == "ArrowRight") {
            this.loop.tick(evt.shiftKey ? 1 : evt.ctrlKey ? 60 : 10);
            this.render();
        } else if (evt.code == "ArrowLeft") {
            this.loop.tick(evt.shiftKey ? -1 : evt.ctrlKey ? -60 : -10);
            this.render();
        } else if (evt.code == "KeyE" && evt.shiftKey && !evt.ctrlKey) {
            this.stop();
            this.exportLoop();
        } else if (evt.code == "KeyP" && !evt.shiftKey && !evt.ctrlKey) {
            this.export("capture.png", 2);
        } else if (evt.code == "KeyR" && !evt.ctrlKey) {
            let filename = evt.shiftKey ? "still.png" : null;
            this.exportStill(filename);
        }
    }

    _connectListeners(connect) {
        let command = connect ? window.addEventListener : window.removeEventListener;
        command("resize", this._setDimensions);
        if (this.debugKeystrokes) {
            command("keydown", this.onKeyDown);
        }
    }

    destroy() {
        this._connectListeners(false);
        this.ticker.remove(this._onFrame);
        this.renderer.destroy();
        this.container.removeChild(this.canvas);
        this.canvas = null;
    }
}



// CONCATENATED MODULE: ./src/props.js
function Props(props) {
    let store = {}
    let calc = {};

    let dependants = {};
    let context;

    let watchers = [];
    let currentStack = [];
    let compute = prop => {
        currentStack.push(prop);
        let val = calc[prop](context);
        currentStack.splice(currentStack.lastIndexOf(prop), 1);
        return val;
    };

    let notify = (prop, value, prevValue) => {
        watchers.forEach(watcher => {
            watcher(prop, value, prevValue);
        });
    };

    let handler = {
        addWatcher: func => {
            watchers.push(func);
        },

        removeWatcher: func => {
            watchers.splice(watchers.indexOf(func), 1);
        },

        loadState(values) {
            // loads given state
            // prior to that figures out the exact update order so that any interdependent variables don't clash with each other
            let keys = Object.keys(values);
            let deps = {};
            Object.entries(dependants).forEach(([key, keyDependants]) => {
                keyDependants.forEach(keyDependant => {
                    deps[keyDependant] = deps[keyDependant] || [];
                    deps[keyDependant].push(key);
                });
            });

            let attempts = 0;
            let order = [];

            // determine if we have any inter-dependencies and set the ones that have none before the ones that do
            function moveAvailable() {
                attempts += 1;
                if (attempts > 6) {
                    throw new Error("State seems to have circular dependencies; bailing");
                }

                keys.forEach(key => {
                    let dependencies = (deps[key] || []).filter(d => !order.includes(d) && values[d] !== undefined);
                    if (dependencies.length == 0) {
                        order.push(key);
                    }
                });

                keys = keys.filter(key => !order.includes(key));
                if (keys.length > 0) {
                    moveAvailable();
                }
            }
            moveAvailable();

            order.forEach(field => {
                context[field] = values[field];
            });
        },
        refresh() {
            // force a recalculation of all properties; generally speaking you shouldn't need this function
            Object.keys(calc).forEach(prop => {
                context[prop] = compute(prop);
            });
        },

        _dependencies: () => dependants,
        derivedProps: () => Object.fromEntries(Object.keys(calc).map(key => [key, store[key]])),

        toUrlParams: () => Object.fromEntries(Object.entries(store).map(([key, val]) => [key, toBase62(val)])),
        fromUrlParams: () => Object.fromEntries(Object.entries(store).map(([key, val]) => [key, fromBase62(val)])),
    };

    context = new Proxy(handler, {
        get(handler, prop) {
            if (Reflect.has(handler, prop)) {
                // access to own functions
                return handler[prop];
            }

            currentStack.forEach(dependant => {
                if (!(dependants[prop] || []).includes(dependant)) {
                    dependants[prop] = dependants[prop] || [];
                    dependants[prop].push(dependant);
                }
            });

            if (Reflect.has(store, prop)) {
                return store[prop];
            }

            if (Reflect.has(calc, prop)) {
                store[prop] = compute(prop);
                return store[prop];
            }

            // in case of undefined we assume null
            store[prop] = null;
            return null;
        },

        set(_handler, prop, val) {
            let exists = Reflect.has(store, prop) || Reflect.has(calc, prop);
            let prevVal = store[prop];

            if (typeof val == "function") {
                calc[prop] = val;
                if (exists) {
                    // on function rewrite we recalc the prop; bit of an edge case
                    val = compute(prop);
                }
            } else {
                if (Reflect.has(calc, prop) && !Reflect.has(store, prop)) {
                    // in the case when the prop already has a calc but we haven't run it yet and are going
                    // straight to setting a value,  make sure we run it at least once to set the dependency tree
                    compute(prop);
                }
                store[prop] = val;
            }

            if (exists) {
                if (val !== prevVal) {
                    notify(prop, val, prevVal);
                }

                if (dependants[prop]) {
                    // we recalc the dependencies on each set no matter as the dependant might depend on a derived
                    // calculation that has been replaced since. there is bit of a 3 cup situation
                    // essentially this is to bust a forced value in a mid-layer
                    dependants[prop].forEach(dependant => {
                        // recalc all dependants
                        context[dependant] = compute(dependant);
                    });
                }
            }

            return true;
        },
    });

    Object.entries(props || {}).forEach(([prop, val]) => {
        context[prop] = val;
    });

    // determine dependencies once initial props have been set
    handler.refresh();
    return context;
}

function round(val, precision = 0) {
    // rounds the number to requested precision. how is this not part of stdlib
    return Math.round(val * Math.pow(10, precision)) / Math.pow(10, precision);
}

function scale(val, min, max, defaultVal, step) {
    // converts the 0..1 value into min..max
    // default is there for convenience
    val = val == null ? (defaultVal - min) / (max - min) || 0 : val;
    let res = min + (max - min) * val;

    let shouldRound = round(min) == min && round(max) == max;
    res = round(res, shouldRound && !step ? 0 : 6);

    if (step) {
        res = res - (res % step);
    }

    return res;
}

let base62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function toBase62(num) {
    if (!num) {
        return "0";
    }

    let res = "";
    let negative = num < 0;
    if (negative) {
        num = Math.abs(num);
    }

    let decimals = 0;
    if (num != Math.round(num)) {
        while (num != Math.round(num) && decimals < 20) {
            decimals += 1;
            num = num * 10;
        }
    }

    let digits = base62.length;
    while (num) {
        res = base62.charAt(num % digits) + res;
        num = Math.floor(num / digits);
    }

    return (negative ? "-" : "") + (decimals ? `.${toBase62(decimals)}` : "") + res;
}

function fromBase62(encoded) {
    let negative = encoded.charAt(0) == "-";
    if (negative) {
        encoded = encoded.slice(1);
    }
    let decimals = 0;
    if (encoded.charAt(0) == ".") {
        decimals = fromBase62(encoded[1]);
        encoded = encoded.slice(2);
    }

    let res = encoded.split("").reduce((total, rixit) => total * base62.length + base62.indexOf(rixit), 0);
    res = (res * (negative ? -1 : 1)) / Math.pow(10, decimals);
    return res;
}

function pseudoTestSetProps() {
    // xxx - move to actual unit tests once i libify the code
    let z = Props({
        a: 3,
        b: 4,
        multiply: vars => `a * b = ${vars.a * vars.b}`,
        decorate: vars => `*** decorate much: ${vars.multiply} ***`,
    });

    z.addWatcher((prop, val, prev) => {
        console.log(prop, "has changed", prev, "-->", val);
    });

    z.b = 6;
}

function pseudoTestEncodeNums() {
    let tests = ["0", "16", "256", "123.456", "0.0000666", "-234234", "-0.123456789", "-0.0000000987654321"];
    tests.forEach(num => {
        console.log("----------------------");
        console.log(num);
        num = parseFloat(num);
        console.log("toBase62", toBase62(num));
        console.log("fromBase62", fromBase62(toBase62(num)).toString());
        if (num != fromBase62(toBase62(num))) {
            console.error("Not equals");
        }
    });
}



// EXTERNAL MODULE: external "chroma"
var external_chroma_ = __webpack_require__(2);
var external_chroma_default = /*#__PURE__*/__webpack_require__.n(external_chroma_);

// CONCATENATED MODULE: ./src/index.js











let hexColor = color => external_chroma_default()(color).num();



/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = chroma;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

if(typeof PIXI === 'undefined') {var e = new Error("Cannot find module 'PIXI'"); e.code = 'MODULE_NOT_FOUND'; throw e;}
module.exports = PIXI;

/***/ })
/******/ ]);