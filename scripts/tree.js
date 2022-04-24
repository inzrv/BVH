import { AABB } from "./aabb.js";
import { triangleAABBIntersection } from "./collision.js";

export class Node {
    constructor(volume, meshTriangle, children, level){
        this.volume = volume;
        this.visibility = false;
        this.children = children;
        this.meshTriangle = meshTriangle;
        this.visNode = null; // Ссылка на узел визуализируемого дерева
        this.level = level; // 0 – лист, 1 – родитель листа, ...
    }
    draw(ctx) {
        if (this.visibility) {
            this.volume.draw(ctx, 0.5, 'gray', 'rgba(100, 100, 100, 0.3)');
        }
        else {
            this.volume.draw(ctx, 0.5, 'gray', null);
        }
    }
    update(camera) {
        if (this.volume instanceof AABB) {
            this.visibility = triangleAABBIntersection(camera.pyramid, this.volume);
        }
        if (this.meshTriangle) {
            this.meshTriangle.update(camera);
        }
    }
}

export class Tree {
    constructor() {
        this.root = null;
    }

    update(camera) {
        this.updateSubTree(camera, this.root);
    }

    updateSubTree(camera, node) {
        if (node) {
            node.update(camera);
            if (node.children) {
                node.children.forEach(child => {
                    this.updateSubTree(camera, child);
                });
            }
        }
    }

    draw(ctx){ // Рисуем дерево в контексте ctx
        this.drawSubTree(ctx, this.root);
    }

    drawSubTree(ctx, node) { // Рисуем поддерево с корнем в node
        if (node) {
            node.draw(ctx);
        }
        if (node.children) {
            node.children.forEach(child => {
                this.drawSubTree(ctx, child);
            });
        }
    }
}