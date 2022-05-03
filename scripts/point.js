export class Point {
    constructor (x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    draw(ctx, lWidth, sStyle,  fStyle) {
        ctx.lineWidth = lWidth;
        ctx.strokeStyle = sStyle;
        ctx.strokeRect(this.x, this.y, 4, 4);
        if (fStyle) {
            ctx.fillStyle = fStyle;
            ctx.fillRect(this.x, this.y, 4, 4);
        }
    }
    isEqual(p2) {
        return (Math.abs(this.x - p2.x) < 0.000001) && (Math.abs(this.y - p2.y) < 0.000001);
    }
}

export function comparePointsXY(point1, point2) {
    if (point1.x < point2.x) {
        return -1;
    }
    if (point1.x > point2.x) {
        return 1;
    }
    return (point1.y - point2.y);
}

export function comparePointsXdownY(point1, point2) {
    if (point1.x > point2.x) {
        return -1;
    }
    if (point1.x < point2.x) {
        return 1;
    }
    return (point1.y - point2.y);
}



export function comparePointsYXdown(point1, point2) {
    if (point1.y < point2.y) {
        return -1;
    }
    if (point1.y > point2.y) {
        return 1;
    }
    return (point2.x - point1.x);
}

export function comparePointsYX(point1, point2) {
    if (point1.y < point2.y) {
        return -1;
    }
    if (point1.y > point2.y) {
        return 1;
    }
    return (point1.x - point2.x);
}