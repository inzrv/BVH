import { trianglesIntersection } from "../collision.js";
import { Triangle } from "../math/triangle.js";

export class MTriangle {
    constructor (pointsArray) {
        this.triangle = new Triangle(pointsArray);
        this.visibility = false;
    }
    draw(ctx) {
        if (!this.visibility) {
            this.triangle.draw(ctx, 0.5, 'black', 'rgba(153, 153, 255, 0.2)');
        }
        else {
            this.triangle.draw(ctx, 0.5, 'black', 'rgba(153, 153, 255, 0.7)');
        }
    }
    update(camera) {
        this.visibility = trianglesIntersection(this.triangle, camera.pyramid);
    }
}