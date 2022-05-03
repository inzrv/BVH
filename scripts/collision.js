import { AABB } from "./aabb.js";
import { MAX_X, MAX_Y } from "./constants.js";
import { crossProduct } from "./cross_product.js";
import { Point } from "./point.js";
import { Vector } from "./vector.js";

// Проверка на пересечение двух отрезков
export function segmentsIntersection(s1Begin, s1End, s2Begin, s2End) {

    const s1MinX = Math.min(s1Begin.x, s1End.x); // Минимум X первого отрезка
    const s1MaxX = Math.max(s1Begin.x, s1End.x); // Максимум X первого отрезка
    const s1MinY = Math.min(s1Begin.y, s1End.y); // Минимум Y первого отрезка
    const s1MaxY = Math.max(s1Begin.y, s1End.y); // Максимум Y первого отрезка

    const s2MinX = Math.min(s2Begin.x, s2End.x); // Минимум X второго отрезка
    const s2MaxX = Math.max(s2Begin.x, s2End.x); // Максимум X второго отрезка
    const s2MinY = Math.min(s2Begin.y, s2End.y); // Минимум Y второго отрезка
    const s2MaxY = Math.max(s2Begin.y, s2End.y); // Максимум Y второго отрезка

    const s1AABB = new AABB(new Point(s1MinX, s1MinY), new Point(s1MaxX, s1MaxY)); // Создаем ограничивающий объем
    const s2AABB = new AABB(new Point(s2MinX, s2MinY), new Point(s2MaxX, s2MaxY));

    if (!AABBsIntersection(s1AABB, s2AABB)) {
        return false;
    }

    if (crossProduct(s1Begin, s2End, s1Begin, s1End) * crossProduct(s1Begin, s2Begin, s1Begin, s1End) <= 0 &&
        crossProduct(s2Begin, s1End, s2Begin, s2End) * crossProduct(s2Begin, s1Begin, s2Begin, s2End) <= 0) {
        return true;
    }
    return false;
}

// Принадлежит ли точка заданному треугольнику? 
export function pointInTriangle(point, triangle) {
    // Получаем точку вне треугольника
    const pointOut = new Point(MAX_X, MAX_Y);
    let intersections = 0;
    for (let i = 0; i < 2; i++) {
        for (let j = i + 1; j < 3; j++) {
            if (segmentsIntersection(point, pointOut, triangle.vertices[i], triangle.vertices[j])) {
                intersections++;
            }
        }
    }
    return (intersections % 2 == 1);
}

// Пересечение двух AABB
export function AABBsIntersection(aabb1, aabb2) {
    if (aabb1.max.x < aabb2.min.x || aabb1.min.x > aabb2.max.x) return false; 
    if (aabb1.max.y < aabb2.min.y || aabb1.min.y > aabb2.max.y) return false; 
   return true; 
}

// Принадлежность точки AABB
export function pointInAABB(point, aabb) {
    return (point.x >= aabb.min.x && point.x <= aabb.max.x && point.y >= aabb.min.y && point.y <= aabb.max.y)
}

// Проверка на пересечение двух треугольников
export function trianglesIntersection(triangle1, triangle2) {
    for (let i = 0; i < 2; i++) {
        if (pointInTriangle(triangle1.vertices[i], triangle2)) {return true};
        for (let j = i + 1; j < 3; j++) {
            for (let k = 0; k < 2; k++) {
                if (pointInTriangle(triangle2.vertices[k], triangle1)) {return true};
                for (let l = k + 1; l < 3; l++){
                    if (segmentsIntersection(triangle1.vertices[i], triangle1.vertices[j], 
                        triangle2.vertices[k], triangle2.vertices[l])) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

export function triangleAABBIntersection(triangle, aabb) {
    for (let i = 0; i < 2; i++) {
        // Если хотя бы одна вершина треугольника лежит внутри бокса
        if (pointInAABB(triangle.vertices[i], aabb)) {return true;}
        for (let j = i + 1; j < 3; j++) {
            if (
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    aabb.min, new Point(aabb.min.x, aabb.max.y)) ||
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    aabb.min, new Point(aabb.max.x, aabb.min.y)) ||
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    aabb.max, new Point(aabb.max.x, aabb.min.y)) ||
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    aabb.max, new Point(aabb.min.x, aabb.max.y))
                )
            {
                return true;
            }
        }
    }
    // Если вершины треугольника не внутри бокса и нет пересечений, то проверяем вершину бокса
    return (pointInTriangle(aabb.min, triangle));
}


export function triangleOBBIntersection(triangle, obb){
    for (let i = 0; i < 2; i++) {
        // Если хотя бы одна вершина треугольника лежит внутри бокса
        if (pointInOBB(triangle.vertices[i], obb)) {return true;}
        for (let j = i + 1; j < 3; j++) {
            if (
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    obb.vertices[0],  obb.vertices[1]) ||
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    obb.vertices[1],  obb.vertices[2]) ||
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    obb.vertices[2],  obb.vertices[3]) ||
                segmentsIntersection(triangle.vertices[i], triangle.vertices[j], 
                    obb.vertices[0],  obb.vertices[3])
                )
            {
                return true;
            }
        }
    }
    // Если вершины треугольника не внутри бокса и нет пересечений, то проверяем вершину бокса
    return (pointInTriangle(obb.vertices[0], triangle));
}


export function pointInOBB(point, obb) {
    let intersections = 0;
    // Получаем точку вне OBB! Подумать как сделать лучше
    const pointOut = new Point(0, 0);
    if(segmentsIntersection(point, pointOut, obb.vertices[0], obb.vertices[1])) {
        let v = new Vector(point, pointOut);
        intersections++;
    }
    if(segmentsIntersection(point, pointOut, obb.vertices[1], obb.vertices[2])) {
        let v = new Vector(point, pointOut);
        intersections++;
    }
    if(segmentsIntersection(point, pointOut, obb.vertices[2], obb.vertices[3])) {
        let v = new Vector(point, pointOut);
        intersections++;
    }
    if(segmentsIntersection(point, pointOut, obb.vertices[3], obb.vertices[0])) {
        let v = new Vector(point, pointOut);
        intersections++;
    }
    return (intersections % 2 == 1);
}