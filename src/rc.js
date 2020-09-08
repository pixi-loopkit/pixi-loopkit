class RC {
    constructor() {
        this.channel = null;
        this._onMessage = this._onMessage.bind(this);
        this._watchers = [];
    }

    connect() {
        if (!this.channel) {
            // setting channel name to contain path so that we don't go broadcasting accross all pages
            // on the domain
            this.channel = new BroadcastChannel(`loopkit-${document.location.pathname}`);
            this.channel.onmessage = this._onMessage;
        }
    }

    send(data) {
        if (!this.channel) {
            this.connect();
        }
        data = typeof data == "string" ? data : JSON.stringify(data);
        this.channel.postMessage(data);
    }

    disconnect() {
        this.channel.close();
        this.channel = null;
    }

    addWatcher(func) {
        this._watchers.push(func);
    }

    removeWatcher(func) {
        this._watchers.splice(this._watchers.indexOf(func), 1);
    }

    _onMessage(event) {
        let data = event.data;
        try {
            data = JSON.parse(data);
        } catch (e) {
            // not a json, we don't judge
        }

        this._watchers.forEach(func => {
            func(data);
        });
    }
}

export {RC};
