# Installing
```
npm install pixi-loopkit
```

# Quick Demo

ES6
```
import {LoopKit, Props, Loop, scale, hexColor} from "pixi-loopkit";

class Thinger extends PIXI.Graphics {
    constructor(x, y, w, h) {
        super();
        [this.x, this.y] = [x + w / 2, y + h / 2];

        this.lineStyle(3, hexColor("#555"), 1);
        this.drawRect(-w / 2, -h / 2, w, h);
    }
}

let rect = new Thinger(100, 100, 100, 100);

let kit = new LoopKit({
    canvas: "#looper",
    bgColor: "#eee",
    onFrame: () => {
        rect.rotation += 0.01;
    },
});
kit.addChild(rect);
```

HTML
```
    <div class="example">
        <canvas id="looper" />
    </div>
```

# Documentation

Soon!
