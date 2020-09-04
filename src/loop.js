class Loop {
    constructor(frames=120) {
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

export {Loop};
