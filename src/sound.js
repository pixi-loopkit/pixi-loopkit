class Sound {
    constructor({sineSamples, freqSamples}) {
        console.log("i'm being recreated");
        this.frequencyMonitor = null;
        this.sineMonitor = null;
        this.connected = false;

        // goes betwwen 2^5 and 2^15 and essentially means how much time data you get
        // for sine that's how long the sample is (at the cost of detail)
        // for freq it's how granular the frequencies you get. e.g. if it's just "is there noise", can set to the lowest
        this.sineSamples = sineSamples || Math.pow(2, 10);
        this.freqSamples = freqSamples || Math.pow(2, 10);
    }

    async connect() {
        let stream = await navigator.mediaDevices.getUserMedia({audio: true});
        let ctx = new AudioContext();

        this.frequencyMonitor = new AnalyserNode(ctx, {
            minDecibels: -80,
            maxDecibels: -10,
            smoothingTimeConstant: 0.8,
            fftSize: this.freqSamples,
        });
        this._frequencyBuffer = new Uint8Array(this.frequencyMonitor.frequencyBinCount);

        this.sineMonitor = new AnalyserNode(ctx, {
            minDecibels: -80,
            maxDecibels: -10,
            smoothingTimeConstant: 0.8,
            fftSize: this.sineSamples,
        });
        this._sineBuffer = new Uint8Array(this.sineMonitor.fftSize);

        let source = ctx.createMediaStreamSource(stream);
        source.connect(this.frequencyMonitor);
        source.connect(this.sineMonitor);

        this.connected = true;
    }

    get frequencies() {
        // goes from 0..1 but realistically to ~0.8
        this.frequencyMonitor.getByteFrequencyData(this._frequencyBuffer);
        return [...this._frequencyBuffer].map(val => val / 256.0);
    }

    get sine() {
        // goes from -1..1 because sine wave
        this.sineMonitor.getByteTimeDomainData(this._sineBuffer);
        return [...this._sineBuffer].map(val => (128 - val) / 128.0);
    }

    get volume() {
        return Math.max(...this.frequencies);
    }
}

export {Sound};
