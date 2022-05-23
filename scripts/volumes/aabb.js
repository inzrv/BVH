import { comparePointsXY, Point } from "../math/point.js";
import { crossProduct } from "../math/cross_product.js";
import { MAX_X, MAX_Y, MIN_X, MIN_Y } from "../scene/constants.js";

// Класс для выровненного по осям прямоугольника
// Объект храниться как левая верхняя вершина и правая нижняя вершина

export class AABB {
    constructor (minPoint, maxPoint) {
        this.min = minPoint;
        this.max = maxPoint;
    }
    area() { // Возвращает площадь прямоугольника
        return Math.abs(crossProduct(this.min, new Point(this.max.x, this.min.y), 
            this.min, new Point(this.min.x, this.max.y)));
    }
    draw(ctx, lWidth, sStyle,  fStyle) {
        ctx.lineWidth = lWidth;
        ctx.strokeStyle = sStyle;
        ctx.strokeRect(this.min.x, this.min.y, this.max.x - this.min.x, this.max.y - this.min.y);
        if (fStyle) {
            ctx.fillStyle = fStyle;
            ctx.fillRect(this.min.x, this.min.y, this.max.x - this.min.x, this.max.y - this.min.y);
        }
    }
}

// Построить AABB для треугольника
export function AABBForTriangle(triangle) {
    let minX = MAX_X;
    let minY = MAX_Y;
    let maxX = MIN_X;
    let maxY = MIN_Y;
    for (let i = 0; i < 3; i++) {
        minX = Math.min(triangle.vertices[i].x, minX);
        maxX = Math.max(triangle.vertices[i].x, maxX);
        minY = Math.min(triangle.vertices[i].y, minY);
        maxY = Math.max(triangle.vertices[i].y, maxY);
    }
    return new AABB(new Point(minX, minY), new Point(maxX, maxY));
}

// Построить AABB для двух AABB
export function AABBForAABBs(aabb1, aabb2) {
    const minX = Math.min(aabb1.min.x, aabb2.min.x);
    const maxX = Math.max(aabb1.max.x, aabb2.max.x);
    const minY = Math.min(aabb1.min.y, aabb2.min.y);
    const maxY = Math.max(aabb1.max.y, aabb2.max.y);
    return new AABB(new Point(minX, minY), new Point(maxX, maxY));
}

export function minAABB(points){ // Возвращаем минимальный AABB для набора точек
    if (points == []) {
        return {};
    }
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (let i = 0; i < points.length; i++) {
        if (points[i].x < minX) {
            minX = points[i].x;
        }
        if (points[i].x > maxX) {
            maxX = points[i].x;
        }
        if (points[i].y < minY) {
            minY = points[i].y;
        }
        if (points[i].y > maxY) {
            maxY = points[i].y;
        }
    }
    return new AABB(new Point(minX, minY), new Point(maxX, maxY));
}