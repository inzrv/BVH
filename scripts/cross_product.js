import { Point } from "./point.js"
// Вычисление векторного произведения двух векторов
// Векторы заданы через две точки (Point)
export function crossProduct(vec1Start, vec1End, vec2Start, vec2End) {
    const vec1NewEnd = new Point(vec1End.x - vec1Start.x, vec1End.y - vec1Start.y);
    const vec2NewEnd = new Point(vec2End.x - vec2Start.x, vec2End.y - vec2Start.y);
    return vec1NewEnd.x * vec2NewEnd.y - vec1NewEnd.y * vec2NewEnd.x;
}