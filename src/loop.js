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
        this._loopSeconds = seconds;
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

export {Loop};
