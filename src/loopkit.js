import {Loop, hexColor} from ".";
let PIXI = {};
try {
    PIXI = require("pixi.js");
} catch (e) {
    // on serverside rendering, rather than dying gracefully, pixi will explode as it tries to access window
    console.log("Failed to import PIXI somehow. You're on your own!");
}

class LoopKit {
    constructor({canvas, onFrame, antialias, bgColor, frames, debugKeystrokes, stillsOpacity}) {
        canvas = typeof canvas == "string" ? document.querySelector(canvas) : canvas;
        this.canvas = canvas;
        this.width = 0;
        this.height = 0;
        this.loop = new Loop(frames || 60);
        this.debugKeystrokes = debugKeystrokes === undefined ? true : debugKeystrokes;
        this.stillsOpacity = stillsOpacity || 0.2;

        this.renderer = new PIXI.Renderer({
            view: canvas,
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
    }
}

export {LoopKit};
