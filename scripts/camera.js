import { Point } from "./point.js";
import { Triangle } from "./triangle.js";


export class Camera {
    constructor(alpha, dst) {
        this.speed = 5;
        this.velocity = { // скорость по координатам
            x : 0,
            y : 0
        }
        this.angle = 0; // Угол между главной оптической осью и горизонталью

        // alpha -- угол обзора камеры
        // dst - расстояние до вертикальной границы отсечения 

        this.pyramid = new Triangle([
            new Point(100, 100), // первый элемент -- точка фокуса
            new Point(100 + dst, 100 - dst * Math.tan(alpha / 2)), //второй элемент - левый угол
            new Point(100 + dst, 100 + dst * Math.tan(alpha / 2)) //правый угол
        ]);
    }
    draw(ctx) {
        this.pyramid.draw(ctx, 1, 'black', null);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.pyramid.vertices[0].x - 2 , this.pyramid.vertices[0].y - 2, 4, 4);
    }

    update() { // перемещение камеры
        for (let i = 0; i < 3; i++) {
            this.pyramid.vertices[i].x += this.velocity.x;
            this.pyramid.vertices[i].y += this.velocity.y;
        }
    }

    // Поворот камеры на угол theta против часовой стрелки вокруг точки фокуса
    rotate(theta) {
        this.angle += theta;
        this.pyramid.rotate(theta, this.pyramid.vertices[0]);
    }
}