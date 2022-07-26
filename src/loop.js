class Loop {
    constructor(frames = 120) {
        this._frames = frames;
        this.frameFull = 0; // goes from 0 to frames
        this.loops = 0; // counter for total loops performed
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

    set frame(frame) {
        this.frameFull = this._frames * frame;
    }

    zig(times = 2, frame) {
        // splits frame's 0->1 into 0->1->0->1->0->1, N times.
        // times=1 matches input, times=2 will render 0->1->0, times=3 will render 0->1->0->1, etc
        frame = frame == null ? this.norm : frame;
        let a = Math.floor(frame * times) % 2;
        let b = frame % (1 / times);
        return Math.abs(a - b * times);
    }

    zigzag(times = 1, frame) {
        // zig and zag back, which means you always end back to where you started 0->1->0. equals to zig(2)
        return this.zig(times * 2, frame);
    }

    fullCircle(callback) {
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
        return (Math.abs(this.frameFull - frames + this.frames) % this.frames) / this.frames;
    }

    tick(frames) {
        let prevFrame = this.frameFull;
        let nextFrame = prevFrame + (frames || 1);

        // wrap around
        nextFrame = (this.frames + nextFrame) % this.frames;

        let forward = (frames || 1) > 0;
        if ((forward && prevFrame > nextFrame) || (!forward && prevFrame < nextFrame)) {
            this.loops += forward ? 1 : -1;
        }

        this.frameFull = nextFrame;
    }
}

export {Loop};
