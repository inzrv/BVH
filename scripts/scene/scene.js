import { MTriangle } from "./m_triangle.js";
import { Point } from "../math/point.js";

export class Scene {
    constructor(){
        this.polygons = [];
        this.size = 0;
    }

    build(str) { // Строим сцену по строке
        this.polygons = parsing(str);
        this.size = this.polygons.length;
    }

    draw(ctx) {
        this.polygons.forEach(poly => {
            poly.draw(ctx);
        })
    }
    getSize(){
        return this.size;
    }
}

function parsing(str) {
    let array = str.split('\n');
    let vertices = [];
    let triangles = [];
    array.forEach(string => {
        if (string != '') {
            let words = string.split(' ');
            if (words[0] == 'v') {
                vertices.push(new Point(Number(words[1]), Number(words[2])));
            }
            else {
                if (words[0] == 'f') {
                    const i = words[1] - 1;
                    const j = words[2] - 1;
                    const k = words[3] - 1;
                    triangles.push(new MTriangle([vertices[i], vertices[j], vertices[k]]));
                }
            }
        } 
    })
    return triangles;
}

export function meshArea(polygons) {
    let area = 0;
    polygons.forEach(poly => {
        area += poly.triangle.area();
    })
    return area;
}