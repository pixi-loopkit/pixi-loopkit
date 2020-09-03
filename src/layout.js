class RadialCluster {
    constructor({x, y, rotation, angle, spacing, innerRadius, rotateNodes}) {
        this.x = x || 0;
        this.y = y || 0;
        this.rotation = rotation || 0;
        this.angle = angle == undefined ? angle : 360;
        this.spacing = spacing || 20;
        this.innerRadius = innerRadius == undefined ? this.spacing : innerRadius;
        this.rotateNodes = rotateNodes;
    }

    position(nodes) {
        let maxAngle = this.angle / 2;
        let spacing = this.spacing;

        let distance = this.innerRadius;
        let angle = -maxAngle;

        function itemsOnLine(distance) {
            let l = (distance * 2 * Math.PI * props.spread) / 360;
            let items = l / spacing;
            return Math.round(items);
        }

        let items = itemsOnLine(distance);

        let i = 0;
        nodes.forEach(node => {
            angle = -props.spread / 2 + (i / items) * props.spread;

            node.x = this.x - Math.sin(rad(angle)) * distance;
            node.y = this.y - Math.cos(rad(angle)) * distance;

            if (this.rotateNodes) {
                node.rotation = rad(-angle);
            }

            if (i >= items) {
                i = 0;
                distance += spacing;
                angle = -maxAngle;
                items = itemsOnLine(distance);
            } else {
                i += 1;
            }
        });
    }
}

class Circular {
    constructor({x, y, r, spacing, angle, rotation}) {
        this.x = x;
        this.y = y;
        this.spacing = spacing;
        this.r = r;
        this.rotation = rotation || 0;
        this.angle = angle == undefined ? 360 : angle; // 0..360
    }

    update(params) {
        Object.entries(params).forEach(([key, val]) => {
            this[key] = val;
        });
    }

    position(nodes) {
        // lay out the nodes
        let angleIncrement = this.angle / nodes.length;

        let [x, y] = [this.x, this.y];
        let degrees = 0;

        // you can specify either radius or spacing, and we'll figure out the distance from there;
        let distance;
        let r = this.r;
        if (this.r) {
            let lineLength = this.r * Math.PI * 2;
            distance = (lineLength / nodes.length) * (this.angle / 360);
        } else {
            distance = this.spacing;
            r = (this.spacing * nodes.length) / (Math.PI * 2); // / (this.angle / 360);
        }

        // center before we start going around
        y += r;
        x += distance / 2;

        nodes.forEach((node, idx) => {
            [node.x, node.y] = [x, y];
            degrees = degrees + angleIncrement;
            x = x - Math.sin(rad(degrees - 90 - this.rotation)) * distance;
            y = y - Math.cos(rad(degrees - 90 - this.rotation)) * distance;
        });
    }
}

function rad(deg) {
    return (deg * Math.PI) / 180;
}

export {RadialCluster, Circular};
