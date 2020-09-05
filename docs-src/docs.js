import {LoopKit, hexColor} from "../src";

let samples = {
    "direct-draw": function () {
        // import {LoopKit, hexColor} from "pixi-loopkit";

        let kit = new LoopKit(".direct-draw .kit", {
            bgColor: "#eee",
        });

        let graphics = kit.graphics;
        graphics.lineStyle(3, hexColor("#666"), 1);
        graphics.drawRect(100.5, 100.5, 100, 100);
    },

    "as-object": function () {
        // import {LoopKit, hexColor} from "pixi-loopkit";
        // import * as PIXI from "pixi.js"

        class Thinger extends PIXI.Graphics {
            constructor(x, y, w, h) {
                super();
                [this.x, this.y] = [x + w / 2, y + h / 2];

                this.lineStyle(3, hexColor("#555"), 1);
                this.drawRect(-w / 2, -h / 2, w, h);
            }
        }

        let rect = new Thinger(100, 100, 100, 100);

        let kit = new LoopKit(".as-object .kit", {
            bgColor: "#eee",
            onFrame: () => {
                rect.rotation += 0.01;
            },
        });
        kit.addChild(rect);
    },
};

// grab all samples and put them in their boxes by the same name
Object.entries(samples).forEach(([key, func]) => {
    let source = func.toString().split("\n").slice(1, -1).join("\n");
    let codeContainer = document.createElement("code");
    codeContainer.innerHTML = source;
    let pre = document.querySelector(`.${key} pre`);
    pre.classList.add("language-js");
    pre.appendChild(codeContainer);
});

// strip extranneous whitespace
document.querySelectorAll("code").forEach(elem => {
    let source = elem.innerHTML;
    source = source.replace(/Object\(_src__WEBPACK_IMPORTED_MODULE_.*\["(.*)"\]\)/g, "$1");
    source = source.replace(/_src__WEBPACK_IMPORTED_MODULE_.*\["(.*)"\]/g, "$1");
    let nw = Prism.plugins.NormalizeWhitespace;
    source = nw.normalize(source);
    elem.innerHTML = source;
});

document.querySelector(".loading").classList.remove("loading");

// run the renders
Object.values(samples).forEach(func => func());
