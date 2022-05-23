import { convexHull } from "../math/convex_hull.js";
import { pointOntoLine, perpendicular } from "../math/projection.js";
import { comparePointsXY, comparePointsYXdown } from "../math/point.js";
import { crossProduct } from "../math/cross_product.js";


export class OBB {
    constructor(vertices) {
        if (vertices.length < 4) {
            console.log('Error! I can not make OBB');
            this.vertices = [];
        }
        else {
            this.vertices = vertices;
        }
    }

    draw(ctx, lWidth, sStyle,  fStyle) {
        ctx.lineWidth = lWidth;
        ctx.strokeStyle = sStyle;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
        if (fStyle) {
            ctx.fillStyle = fStyle;
            ctx.fill();
        }
        ctx.stroke();
    }

    area(){
        return Math.abs(crossProduct(this.vertices[0], this.vertices[1], this.vertices[0], this.vertices[3]));
    }
}

// Возврашает минимальный OBB по переданному набору точек
export function minOBB(points) {
    let hull = convexHull(points);
   // hull.draw(ctx, 1, 'red', 'rgba(255, 0, 0, 0.1)'); 
    const n = hull.vertices.length;
    let minArea = 100000000;
    let minOBBVer = [];

    for (let i = 0; i < n; i++) {
        let j = (i + 1) % n ;
        let allPr = [];
        // Проекции на рассматриваемую сторону
        let points1 = MinMaxProjection(points, hull.vertices[i], hull.vertices[j], comparePointsXY);

        allPr.push(points1.minPr);
        allPr.push(points1.maxPr);  

        // Проекции на меньшую сторону
        let points2Min = AllProjection(points, points1.minPr, points1.minVertex);
        allPr = allPr.concat(points2Min);

        // Проекции на большую сторону  
        let points2Max = AllProjection(points, points1.maxPr, points1.maxVertex);
        allPr = allPr.concat(points2Max);

        let v = VerticesOnProjections(allPr); 

        let curArea = Math.abs(crossProduct(v[0], v[1], v[0], v[3]));
        if (curArea < minArea) {
            minArea = curArea;
            minOBBVer = v;
        }
        //console.log(curSquare);
        //p.draw(ctx, 1, 'gray', null);
    }
    //minOBB.draw(ctx, 1, 'gray', 'rgba(0, 0, 255, 0.1)');
    //console.log(minSquare);
    return new OBB(minOBBVer);
}


// Минимальная и максимальная проекции точки на прямой
// Сравнение осуществляется с помощью compare()
function MinMaxProjection(points, p1, p2, compare) {
    let minVertex = {};
    let maxVertex = {};
    let minPr = p1;
    let maxPr = p1;
    for (let i = 0; i < points.length; i++) {
        let curPr = pointOntoLine(points[i], p1, p2);
        if (compare(curPr, minPr) < 0) {
            minPr = curPr;
            minVertex = points[i];
        }
        if (compare(curPr, maxPr) > 0) {
            maxPr = curPr;
            maxVertex = points[i];
        }
    }

    if (minPr.isEqual(p1)) {
        minVertex = perpendicular(p1, p2);
    }
    else {
        if (minPr.isEqual(p2)) {
            minVertex = perpendicular(p2, p1);
        }
    }

    if (maxPr.isEqual(p1)) {
        maxVertex = perpendicular(p1, p2);
    }
    else {
        if (maxPr.isEqual(p2)) {
            maxVertex = perpendicular(p2, p1);
        }
    }

    return {
        minPr: minPr,
        maxPr: maxPr,
        minVertex: minVertex,
        maxVertex: maxVertex
    }
}

function AllProjection(points, p1, p2) {
    let projections = [];
    for (let i = 0; i < points.length; i++) {
        let curPr = pointOntoLine(points[i], p1, p2);
        projections.push(curPr);
    }
    return projections;
}

function VerticesOnProjections(projections) {
    let left = projections[0];
    let right = projections[0];
    let up = projections[0];
    let down = projections[0];
    for (let i = 0; i < projections.length; i++) {
        if (comparePointsXY(left, projections[i]) > 0) {
            left = projections[i];
        }
        if (comparePointsXY(right, projections[i]) < 0) {
            right = projections[i];
        }
        if (comparePointsYXdown(up, projections[i]) < 0) {
            up = projections[i];
        }
        if (comparePointsYXdown(down, projections[i]) > 0) {
            down = projections[i];
        }
    }
    return [left, up, right, down];
}

export function OBBForTriangle(triangle) {
    return minOBB(triangle.vertices);
}

export function OBBForOBBs(obb1, obb2) {
    let vertices = obb1.vertices;
    vertices = vertices.concat(obb2.vertices);
    return minOBB(vertices);
}