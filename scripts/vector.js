import { Point } from "./point.js";

export class Vector {
    constructor(start, end) {
        this.start = new Point(start.x, start.y);
        this.end = new Point(end.x, end.y);
    }

    normalize() {
        let n = Math.sqrt(Math.pow(this.end.x - this.start.x, 2) + Math.pow(this.end.y - this.start.y, 2));
        if (n != 0) {
            this.end.x = this.start.x + (this.end.x - this.start.x) / n;
            this.end.y = this.start.y + (this.end.y - this.start.y) / n;
        }
    }

    draw(ctx, lWidth, sStyle) {
        ctx.lineWidth = lWidth;
        ctx.strokeStyle = sStyle;
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
        this.end.draw(ctx, lWidth, sStyle, null);
    }
}

export function scaleMultiply(v1, v2) {
    return ((v1.end.x - v1.start.x) * (v2.end.x - v2.start.x)) + 
    ((v1.end.y - v1.start.y) * (v2.end.y - v2.start.y));
}
