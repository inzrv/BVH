import { Point } from "./point.js";
import { Vector, scaleMultiply } from "./vector.js";

export function pointOntoLine(point, p1, p2) {
    let v = new Vector(p1, p2);
    v.normalize();
    let vPoint = new Vector(p1, point);
    let f = scaleMultiply(vPoint, v); // Получаем длину проекции
    return new Point(v.start.x + (v.end.x - v.start.x) * f, v.start.y + (v.end.y - v.start.y) * f);
}

// Точка, лежащая на перпендикуляре к прямой p1p2, проходящего через p1
export function perpendicular(p1, p2) {
    return new Point(p2.y - p1.y + p1.x, - p2.x + p1.x + p1.y);
}