class Beat {
    constructor(bpm, beatsInLoop) {
        // bpm is how many beats per minute are there. e.g. 60 bpm = 1 beat per second
        // beatsInLoop is how many beats are required for a full loop, so if you set it to 10,
        // a full loop will take 10 seconds at 60bpm (1 beat a second -> full loop is 10 seconds)
        // if you pass in a fraction, e.g. beatsInLoop = 1/10, that would mean you want each beat to have 10 loops
        // so it turns into loops-in-beat
        // practically speaking, 2 beatsInLoop at 60bpm will give you 120 frames.
        // this whole stuff is bit mind bendy
        this._bpm = bpm;
        this._beatsInLoop = beatsInLoop;

        this._beatTs = Date.now();

        this._samples = [];
        this._prevSampleTs = null;

        this._prevFrame = 0;
    }

    get bpm() {
        return this._bpm;
    }

    get beatsInLoop() {
        return this._beatsInLoop;
    }

    set bpm(bpm) {
        let now = Date.now();
        let ms = now - this._beatTs;
        this._beatTs = new Date(now - (ms * this._bpm) / bpm);
        this._bpm = bpm;
    }

    set beatsInLoop(beats) {
        let now = Date.now();
        let ms = now - this._beatTs;
        this._beatTs = new Date(now - (ms / this._beatsInLoop) * beats);
        this._beatsInLoop = beats;
    }

    tick() {
        let now = Date.now();
        this._beatTs = this._beatTs || now;
        let delta = (now - this._beatTs) / 1000;
        // instead of ticking, we tell loop which frame we're on
        let next = ((delta * (this.bpm / 60)) / this._beatsInLoop) % 1;

        let stepDelta = next - this._prevFrame;
        this._prevFrame = next;

        // returns current frame, boolean whether we encountered a beat, and finally delta between this and prev frame
        // so you can do your own man
        return [next, stepDelta < 0, stepDelta >= 0 ? stepDelta : stepDelta + 1];
    }

    rewind(frame) {
        this._beatTs = new Date(Date.now() - ((frame * 1000) / (this.bpm / 60)) * this.beatsInLoop);
    }

    sample() {
        // Takes timestamp sample, and once we have at least 3 samples, starts reporting BPM
        // The BPM report is a variant of mode. We inspect user input in triplets and then return the most popular
        // version.
        let now = new Date();
        if (!this._prevSampleTs) {
            this._prevSampleTs = now;
            return;
        }
        let elapsed = now - this._prevSampleTs;
        this._prevSampleTs = now;

        if (elapsed > 1000) {
            this._samples = [];
        } else {
            // keep to 8 samples
            this._samples = this._samples.slice(-8);
            this._samples.push(now);
        }

        if (this._samples.length > 2) {
            let byBpm = {};
            for (let i = 0; i < this._samples.length - 2; i++) {
                let triplet = this._samples.slice(i, i + 3);
                let perSample = (triplet[2] - triplet[0]) / 2;
                let bpm = Math.round((1000 / perSample) * 60);
                while (bpm > 190) {
                    // we assume a sane range of BPM and if the user samples 240 we just assume they tapped in
                    // the up-beat as well
                    bpm = bpm / 2;
                }
                bpm = bpm - (bpm % 2);

                byBpm[bpm] = (byBpm[bpm] || 0) + 1;
            }

            // grab the bpms that have the most samples
            let mostSamples = Math.max(...Object.values(byBpm));
            let popularBpms = Object.entries(byBpm)
                .filter(rec => rec[1] == mostSamples)
                .map(rec => parseInt(rec[0]));

            let avgBpms = Math.round(popularBpms.reduce((sum, cur) => sum + cur, 0) / popularBpms.length);
            return avgBpms - (avgBpms % 2);
        }
    }
}

export {Beat};
