import {Loop, hexColor} from ".";
let PIXI = {};
try {
    PIXI = require("pixi.js");
} catch (e) {
    // on serverside rendering, rather than dying gracefully, pixi will explode as it tries to access window
    console.log("Failed to import PIXI somehow. You're on your own!");
}

class LoopKit {
    constructor(container, {onFrame, antialias, bgColor, frames, debugKeystrokes, bpm, beatsPerLoop, name}) {
        container = typeof container == "string" ? document.querySelector(container) : container;
        this.container = container;
        this.width = 0;
        this.height = 0;
        this.loop = new Loop(frames || 60);
        this.debugKeystrokes = debugKeystrokes === undefined ? true : debugKeystrokes;

        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);

        this.bpm = bpm;
        this.beatsPerLoop = beatsPerLoop || 1;

        // solely for exports but who knows, maybe we'll find a higher purpose later
        this.name = name;

        this.renderer = new PIXI.Renderer({
            view: this.canvas,
            antialias: antialias !== undefined ? antialias : true,
            resolution: window.devicePixelRatio,
            autoDensity: true,
            preserveDrawingBuffer: true,
            clearBeforeRender: false,
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

        this._fpsTs = [];
        this._ticks = 0;
        this._fps = 0;

        if (onFrame) {
            this.onFrame = onFrame.bind(this);
            this.ticker.start();
        }

        this._beatTs = Date.now();
    }

    _onFrame(tick = true) {
        if (!this.onFrame) {
            // nothing to do if there is no callback
            return;
        }

        if (tick) {
            if (this.bpm) {
                this._beatTs = this._beatTs || Date.now();
                let time = Date.now();
                let delta = (time - this._beatTs) / 1000;
                // instead of ticking, we tell loop which frame we're on as it's we use loop's frame merely so we don't carry around
                let next = ((delta * (this.bpm / 60)) / this.beatsPerLoop) % 1;
                if (next < this.frame) {
                    // full loop
                    this.loop.loops += 1;
                }
                this.loop.frame = next;
            } else {
                this.loop.tick();
            }

            this._ticks += 1;
            if (this._ticks == 6) {
                // capture fps every 10 frames
                this._ticks = 0;
                this._fpsTs.push(Date.now());
                this._fpsTs = this._fpsTs.slice(-3);
                if (this._fpsTs.length == 3) {
                    // the 3 - 1 is because we have n timestamps, but n-1 timespans
                    let msPerFrame = (this._fpsTs[2] - this._fpsTs[0]) / 6 / (3 - 1);
                    this._fps = Math.round(1000 / msPerFrame);
                }
            }
        }

        this.onFrame(this.graphics, this.loop.frame);
        this.renderer.render(this._root);
    }

    get frame() {
        return this.loop.frame;
    }

    set frame(frame) {
        if (this.bpm) {
            // rewinding time the according amount
            this._beatTs = new Date(Date.now() - ((frame * 1000) / (this.bpm / 60)) * this.beatsPerLoop);
        }
        this.loop.frame = frame;
    }

    get bpm() {
        return this._bpm;
    }

    get beatsPerLoop() {
        return this._beatsPerLoop;
    }

    set bpm(bpm) {
        let now = Date.now();
        let ms = now - this._beatTs;
        this._beatTs = new Date(now - (ms * this._bpm) / bpm);
        this._bpm = bpm;
    }

    set beatsPerLoop(beats) {
        let now = Date.now();
        let ms = now - this._beatTs;
        this._beatTs = new Date(now - (ms / this._beatsPerLoop) * beats);
        this._beatsPerLoop = beats;
    }

    get fps() {
        return this._fps;
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
    removeChild(...child) {
        this.graphics.removeChild(...child);
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

    export(filename) {
        let objectURL = this.canvas.toDataURL();
        if (filename) {
            let element = document.createElement("a");
            element.setAttribute("href", objectURL);
            element.setAttribute("download", filename);
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            window.URL.revokeObjectURL(objectURL);
        } else {
            return objectURL;
        }
    }

    async exportLoop() {
        this.stop();
        let tape;
        try {
            let Tar = require("tar-js");
            tape = new Tar();
        } catch (e) {
            console.warn(
                "Couldn't import tar-js and will export PNGs one-by one." +
                    "If you miss a frame after export, simply re-export till you have all the frames"
            );
        }

        function stringToUint8(input) {
            let out = new Uint8Array(input.length);
            for (let i = 0; i < input.length; i++) {
                out[i] = input.charCodeAt(i);
            }
            return out;
        }

        await this.loop.fullCircle(async (_frame, idx) => {
            this._onFrame(false);
            let paddedIdx = ("0000" + idx).slice(-4);
            let filename = `frames/${paddedIdx}.png`;
            if (tape) {
                console.log("Adding", filename);
                let data = this.export().slice("data:image/png;base64,".length);
                data = stringToUint8(atob(data));
                await tape.append(filename, data);
            } else {
                this.export(filename);
            }
        });
        if (tape) {
            await _generateTar(tape, this.loop.frames, this.name);
        }
    }

    exportStill(filename, opacity) {
        this.stop();
        this.loop.frameFull = 0;
        this.graphics.alpha = opacity || 0.2;

        this.loop.fullCircle((_frame, idx) => {
            this.bg.visible = idx == 0; // we want our smear, so disable background after first frame
            this._onFrame(false);
            console.log("rendering", _frame, idx);
        });
        this.graphics.alpha = 1;
        this.bg.visible = true;

        if (filename) {
            let objectURL = this.canvas.toDataURL();
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
            this.export(`${this.name || "capture"}.png`, 2);
        } else if (evt.code == "KeyR" && !evt.ctrlKey) {
            let filename = evt.shiftKey ? `${this.name ? this.name + "-" : ""}still.png` : null;
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

        // let's see if we can actually lose the context
        let gl = this.canvas.getContext("webgl2") || this.canvas.getContext("webgl");
        gl.getExtension("WEBGL_lose_context").loseContext();

        // remove any pointers
        this.canvas = null;
        this.ticker = null;
        this.container = null;
    }
}

async function _generateTar(tape, frames, name) {
    console.log("Zipping...");
    name = name || "loop";

    // we will gonna add a few silly bash scripts
    let out = tape.append(
        "gif.sh",
        "#!/bin/sh\n" +
            `ffmpeg -y -framerate 50 -i frames/%04d.png -filter_complex "[0:v] fps=50,split [a][b];[a] palettegen [p];[b][p] paletteuse" ${name}.gif`,
        ["mode-755"]
    );

    out = tape.append(
        "gif-scaled.sh",
        "#!/bin/sh\n" +
            `ffmpeg -y -framerate 50 -i frames/%04d.png -filter_complex "[0:v] scale=510:510,fps=50,split [a][b];[a] palettegen [p];[b][p] paletteuse" ${name}-scaled.gif`,
        ["mode-755"]
    );

    // we want the video to be approx 30 seconds for slow contemplation
    let repetitions = Math.round((30 * 60) / frames);
    out = tape.append(
        "mp4-30s-loop.sh",
        "#!/bin/sh\n" +
            `ffmpeg -y -framerate 50 -i frames/%04d.png -filter_complex loop=${repetitions}:${frames}:0 -vcodec libx264 -pix_fmt yuv420p -crf 20 ${name}.mp4`,
        ["mode-755"]
    );

    function uint8ToString(buf) {
        let out = "";
        for (let i = 0; i < buf.length; i++) {
            out += String.fromCharCode(buf[i]);
        }
        return out;
    }
    let base64 = btoa(uint8ToString(out));

    let url = "data:application/tar;base64," + base64;
    let element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute("download", `${name}.tar`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    console.log("Done.");
}

export {LoopKit};
