import { crossProduct } from "./cross_product.js";
import { Point } from "./point.js";

export class Triangle {
    constructor(pointsArray) {
        this.vertices = [];
        pointsArray.forEach(point => {
            this.vertices.push(new Point(point.x, point.y))
        })
    }
    area() { // Площадь данного треугольника
        return Math.abs(crossProduct(
            this.vertices[0],
            this.vertices[1],
            this.vertices[0],
            this.vertices[2]
        )) / 2;
    }

    draw(ctx, lWidth, sStyle,  fStyle) {
        ctx.lineWidth = lWidth;
        ctx.strokeStyle = sStyle;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < 3; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
        if (fStyle) {
            ctx.fillStyle = fStyle;
            ctx.fill();
        }
        ctx.stroke();
    }

    rotate(theta, pivot) { // Поворот треугольника вокруг точки pivot на угол theta против часовой

        // Массив под новые значения точек
        let newPoints = [new Point(), new Point(), new Point()];

        // Перемещаем точки вокруг опорной f_point
        for (let i = 0; i < 3; i++) {

            newPoints[i].x = (this.vertices[i].x - pivot.x) * Math.cos(-theta) - 
            (this.vertices[i].y - pivot.y) * Math.sin(-theta) + pivot.x;

            newPoints[i].y = (this.vertices[i].x - pivot.x) * Math.sin(-theta) +
            (this.vertices[i].y - pivot.y) * Math.cos(-theta) + pivot.y;

            this.vertices[i] = newPoints[i];
        }
    }
}