import { Polygon } from "./poly.js";
import { comparePointsXY, Point } from "./point.js";
import { Vector } from "./vector.js";

export function isPointRight(p, v) {
    return (v.end.x - v.start.x) * (p.y - v.start.y) - (p.x - v.start.x) * (v.end.y - v.start.y) > 0;
}

export function convexHull(oldPoints) {
    const n = oldPoints.length;
    if (n < 3) {
        return {};
    }
    let points = [];
    oldPoints.forEach(oldPoint => {
        points.push(new Point(oldPoint.x, oldPoint.y));
    });

    points.sort(comparePointsXY);
    let lstUp = []; // Массив для вершин из верхней оболочки
    lstUp.push(points[0]);
    lstUp.push(points[1]);
    for (let i = 2; i < n; i++) {
        lstUp.push(points[i]);
        while (lstUp.length > 2) {
            let v = new Vector(lstUp[lstUp.length - 3], lstUp[lstUp.length - 2]);
            if (isPointRight(lstUp[lstUp.length - 1], v)) {
                break;
            }
            lstUp.splice(lstUp.length - 2, 1);
        }
    }
    let lstDown = [];
    lstDown.push(points[n -1]);
    lstDown.push(points[n - 2]);
    for (let i = n - 3; i > -1; i--) {
        lstDown.push(points[i]);
        while (lstDown.length > 2) {
            let v = new Vector(lstDown[lstDown.length - 3], lstDown[lstDown.length - 2]);
            if (isPointRight(lstDown[lstDown.length - 1], v)) {
                break;
            }
            lstDown.splice(lstDown.length - 2, 1);
        }
    }
    lstDown.shift();
    lstDown.pop();
    let lst = [];
    lst = lst.concat(lstUp, lstDown);
    return new Polygon(lst);
}