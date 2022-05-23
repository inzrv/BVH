import { Point } from "./math/point.js";
import { Triangle } from "./math/triangle.js";


export class Camera {
    constructor(alpha, dst, x = 100, y = 100, theta = 0) {
        this.speed = 5;
        this.velocity = { // скорость по координатам
            x : 0,
            y : 0
        }

        // alpha -- угол обзора камеры
        // dst - расстояние до вертикальной границы отсечения 

        this.pyramid = new Triangle([
            new Point(x, y), // первый элемент -- точка фокуса
            new Point(x + dst, y - dst * Math.tan(alpha / 2)), //второй элемент - левый угол
            new Point(x + dst, y + dst * Math.tan(alpha / 2)) //правый угол
        ]);
        this.rotate(theta);
    }
    draw(ctx) {
        this.pyramid.draw(ctx, 1, 'black', null);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.pyramid.vertices[0].x - 2 , this.pyramid.vertices[0].y - 2, 4, 4);
        ctx.font = '12px Arial';
        ctx.fillText("camera", this.pyramid.vertices[0].x - 20,  this.pyramid.vertices[0].y + 15);
    }

    update() { // перемещение камеры
        for (let i = 0; i < 3; i++) {
            this.pyramid.vertices[i].x += this.velocity.x;
            this.pyramid.vertices[i].y += this.velocity.y;
        }
    }

    // Поворот камеры на угол theta против часовой стрелки вокруг точки фокуса
    rotate(theta) {
        this.pyramid.rotate(theta, this.pyramid.vertices[0]);
    }

    // Получить угол между главной оптической осью и горизонтом
    getAngle(){
        const mid = new Point((this.pyramid.vertices[1].x + this.pyramid.vertices[2].x) / 2,
            (this.pyramid.vertices[1].y + this.pyramid.vertices[2].y) / 2);
        const deltaX = Number(mid.x - this.pyramid.vertices[0].x);
        const deltaY = Number(this.pyramid.vertices[0].y - mid.y);
        const theta = Math.atan(deltaY / deltaX);

        if (deltaX < 0 && Math.abs(deltaY) < 0.00001) {
            return Math.PI;
        }
        else {
            if (deltaX < 0 && deltaY > 0) {
                return theta + Math.PI;
            }
            else {
                if (deltaX < 0 && deltaY < 0) {
                   return theta - Math.PI;
                }
                else {
                    return theta;
                }
    
            }
        }
    }
    
    getPos(){
        return this.pyramid.vertices[0];
    }
}