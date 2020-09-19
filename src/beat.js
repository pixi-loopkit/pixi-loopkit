class Beat {
    constructor(bpm, beatsPerLoop) {
        this._bpm = bpm;
        this._beatsPerLoop = beatsPerLoop;

        this._beatTs = Date.now();
        this._prevBeatTs = null;

        this._samples = [];
        this._prevSampleTs = null;
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

    tick() {
        this._beatTs = this._beatTs || Date.now();
        let time = Date.now();
        let delta = (time - this._beatTs) / 1000;
        // instead of ticking, we tell loop which frame we're on
        let next = ((delta * (this.bpm / 60)) / this.beatsPerLoop) % 1;

        let beatDelta = (delta * (this.bpm / 60)) % 1;
        let discreet = null;
        if (beatDelta > 0.95 && time - this._prevBeatTs > 300) {
            this._prevBeatTs = time;
            discreet = true;
        }
        return [next, discreet];
    }

    rewind(frame) {
        this._beatTs = new Date(Date.now() - ((frame * 1000) / (this.bpm / 60)) * this.beatsPerLoop);
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
            return avgBpms - avgBpms % 2;
        }
    }
}

export {Beat};
