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

module.exports = PIXI;

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "LoopKit", function() { return /* reexport */ loopkit_LoopKit; });
__webpack_require__.d(__webpack_exports__, "Props", function() { return /* reexport */ Props; });
__webpack_require__.d(__webpack_exports__, "Loop", function() { return /* reexport */ Loop; });
__webpack_require__.d(__webpack_exports__, "scale", function() { return /* reexport */ scale; });
__webpack_require__.d(__webpack_exports__, "hexColor", function() { return /* binding */ hexColor; });

// EXTERNAL MODULE: external "chroma"
var external_chroma_ = __webpack_require__(2);
var external_chroma_default = /*#__PURE__*/__webpack_require__.n(external_chroma_);

// CONCATENATED MODULE: ./src/props.js
function Props(props) {
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

    let store = {
        addWatcher: func => {
            watchers.push(func);
        },

        removeWatcher: func => {
            watchers.splice(watchers.indexOf(func), 1);
        },

        loadState(values) {
            Object.assign(context, values);
        },
        refresh() {
            // force a recalculation of all properties; generally speaking you shouldn't need this function
            Object.keys(calc).forEach(prop => {
                context[prop] = compute(prop);
            });
        },

        _dependencies: () => dependants,
        derivedProps: () => Object.fromEntries(Object.keys(calc).map(key => [key, context[key]])),
    };

    context = new Proxy(store, {
        get(store, prop) {
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

        set(store, prop, val) {
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
    store.refresh();

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

function pseudoTest() {
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



// CONCATENATED MODULE: ./src/loop.js
class Loop {
    constructor(loopSeconds = 4, fps = 60) {
        this._loopSeconds = loopSeconds;
        this.fps = fps;
        this.frameFull = 0; // goes from 0 to frames
    }

    get frames() {
        return this.loopSeconds * this.fps - 1;
    }

    get frame() {
        return this.frameFull / this.frames;
    }

    get loopSeconds() {
        return this._loopSeconds;
    }

    set loopSeconds(seconds) {
        // when duration of loop is changed on the fly, we try to stay roughly in the same place
        let frame = this.frame;
        this._loopSeconds = seconds
        this.frameFull = Math.floor(this.frames * frame);
    }

    delay(frames) {
        return (Math.abs(this.frameFull - frames) % this.frames) / this.frames;
    }

    tick(frames) {
        let nextFrame = this.frameFull + (frames || 1);
        this.frameFull = (this.frames + nextFrame) % this.frames;
    }
}



// EXTERNAL MODULE: external "PIXI"
var external_PIXI_ = __webpack_require__(0);

// CONCATENATED MODULE: ./src/loopkit.js




class loopkit_LoopKit {
    constructor({canvas, onFrame, antialias, bgColor, loopSeconds}) {
        canvas = typeof canvas == "string" ? document.querySelector(canvas) : canvas;
        this.canvas = canvas;
        this.width = 0;
        this.height = 0;
        this.looper = new Loop(loopSeconds || 1);

        this.app = new external_PIXI_["Application"]({
            view: canvas,
            antialias: antialias !== undefined ? antialias : true,
        });

        if (bgColor) {
            this.bgColor = hexColor(bgColor);
            this.bg = new external_PIXI_["Graphics"]();
            this.app.stage.addChild(this.bg);
        }

        this.graphics = new external_PIXI_["Graphics"]();
        this.app.stage.addChild(this.graphics);

        this.setDimensions = this.setDimensions.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this._connectListeners(true);

        this._renderPending = null;

        this.setDimensions();

        this.app.ticker.add(this._onFrame.bind(this));
        if (onFrame) {
            this.onFrame = onFrame.bind(this);
        } else {
            this.stop();
        }

        this.render();
    }

    _onFrame(tick) {
        if (!this.onFrame) {
            return;
        }
        if (tick !== false) {
            this.looper.tick();
        }
        this.onFrame(this.graphics, this.looper.frame);
    }

    start() {
        if (!this.onFrame) {
            // no point to tick if nobody's listening
            return;
        }
        this.app.ticker.start();
    }
    stop() {
        this.app.ticker.stop();
    }
    pause(pause) {
        pause = pause === undefined ? this.app.ticker.started : pause;
        pause ? this.stop() : this.start();
    }

    render() {
        if (this.app.ticker.started) {
            // ignore as we are rendering anyway
            return;
        }

        window.cancelAnimationFrame(this._renderPending);
        this._renderPending = window.requestAnimationFrame(() => {
            this._onFrame(false);
            this.app.render();
        });
    }

    addChild(child) {
        this.graphics.addChild(child);
    }
    removeChild(child) {
        this.graphics.removeChild(child);
    }

    setDimensions(evt) {
        let box = this.canvas.parentElement.getBoundingClientRect();
        [this.width, this.height] = [box.width, box.height];
        this.canvas.style.width = this.width;
        this.canvas.style.height = this.height;
        this.app.renderer.resize(box.width, box.height);

        if (this.bg) {
            this.bg.clear();
            this.bg.beginFill(this.bgColor);
            this.bg.drawRect(0, 0, this.width, this.height);
            this.bg.endFill();
        }
    }

    export(filename) {
        let renderTexture = external_PIXI_["RenderTexture"].create({width: this.width * 2, height: this.height * 2});
        renderTexture.setResolution(2);
        this.app.renderer.render(this.app.stage, renderTexture);

        let objectURL = this.app.renderer.plugins.extract.base64(renderTexture, "image/png", 1);

        let element = document.createElement("a");
        element.setAttribute("href", objectURL);
        element.setAttribute("download", filename || "capture.png");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(objectURL);
    }

    exportLoop() {
        this.stop();
        this.looper.frameFull = 0;
        for (let i = 0; i <= this.looper.frames; i++) {
            this._onFrame(false);
            let paddedIdx = ("0000" + i).slice(-4);
            this.export(`frame-${paddedIdx}.png`);
            this.looper.tick();
        }
    }

    onKeyDown(evt) {
        if (evt.key == " ") {
            this.pause();
        } else if (evt.key == "ArrowRight") {
            this.looper.tick(evt.shiftKey ? 1 : evt.ctrlKey ? 60 : 10);
            this.render();
        } else if (evt.key == "ArrowLeft") {
            this.looper.tick(evt.shiftKey ? -1 : evt.ctrlKey ? -60 : -10);
            this.render();
        } else if (evt.key == "e") {
            this.stop();
            this.exportLoop();
        } else if (evt.key == "p") {
            this.export();
        }
    }

    _connectListeners(connect) {
        let command = connect ? window.addEventListener : window.removeEventListener;
        command("resize", this.setDimensions);
        command("keydown", this.onKeyDown);
    }

    destroy() {
        this._connectListeners(false);
        this.app.destroy();
    }
}



// CONCATENATED MODULE: ./src/index.js









// in case you want everything under the same namespace
const loopkit = {LoopKit: loopkit_LoopKit, Props: Props, Loop: Loop, scale: scale};
/* harmony default export */ var src = __webpack_exports__["default"] = ({loopkit});


let hexColor = color => external_chroma_default()(color).num();



/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = chroma;

/***/ })
/******/ ]);