import {Loop, hexColor} from ".";

import * as PIXI from "pixi.js";

class LoopKit {
    constructor({canvas, onFrame, antialias, bgColor, loopSeconds}) {
        canvas = typeof canvas == "string" ? document.querySelector(canvas) : canvas;
        this.canvas = canvas;
        this.width = 0;
        this.height = 0;
        this.looper = new Loop(loopSeconds || 1);

        this.app = new PIXI.Application({
            view: canvas,
            antialias: antialias !== undefined ? antialias : true,
        });

        if (bgColor) {
            this.bgColor = hexColor(bgColor);
            this.bg = new PIXI.Graphics();
            this.app.stage.addChild(this.bg);
        }

        this.graphics = new PIXI.Graphics();
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

    export(filename, rt) {
        let renderTexture = rt || PIXI.RenderTexture.create({
            width: this.width,
            height: this.height,
            resolution: 4 ,
        });
        this.app.renderer.render(this.app.stage, renderTexture, false);

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
        let rt = PIXI.RenderTexture.create({
            width: this.width,
            height: this.height,
            resolution: 4 ,
        });

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

export {LoopKit};
