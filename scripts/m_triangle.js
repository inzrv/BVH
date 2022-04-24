import { trianglesIntersection } from "./collision.js";
import { Triangle } from "./triangle.js";

export class MTriangle {
    constructor (pointsArray) {
        this.triangle = new Triangle(pointsArray);
        this.visibility = false;
    }
    draw(ctx) {
        if (!this.visibility) {
            this.triangle.draw(ctx, 0.7, 'black', null);
        }
        else {
            this.triangle.draw(ctx, 0.7, 'rgb(51, 0, 102)', 'rgb(153, 153, 255)');
        }
    }
    update(camera) {
        this.visibility = trianglesIntersection(this.triangle, camera.pyramid);
    }
}