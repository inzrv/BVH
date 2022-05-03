import { AABB } from "./aabb.js";
import { triangleAABBIntersection, triangleOBBIntersection } from "./collision.js";
import { OBB } from "./obb.js";

export class Node {
    constructor(volume, meshTriangle, children, level){
        this.volume = volume;
        this.visibility = true;
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
        if (this.volume instanceof OBB) {
            this.visibility = triangleOBBIntersection(camera.pyramid, this.volume);
        }
    }
    setInvisible(){
        this.visibility = false;
        if (this.meshTriangle) {
            this.meshTriangle.visibility = false;
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

    setInvisibleSubTree(node) { // Делает дерево с корнем node невидимым
        if (node) {
            node.setInvisible();
            if (node.children) {
                node.children.forEach(child => {
                    this.setInvisibleSubTree(child);
                });
            }
        }
    }

    updateSubTree(camera, node) {
        if (node) {
            node.update(camera);
            if (node.visibility) { // Если после обновления данного узла он виден, то идем в детей и проверяем
                if (node.children) {
                    node.children.forEach(child => {
                        this.updateSubTree(camera, child);
                    });
                }
            }
            else {
                this.setInvisibleSubTree(node); // Делаем поддерево с корнем node невидимым
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


export function visibleNodesNumber(T) {
    return visibleNodeSubTree(T.root);
}

function visibleNodeSubTree(node) {
    if (node == null) {
        return 0;
    }
    let counter = 0;
    if (node.visibility) {
        counter++;
        if (node.children){
            node.children.forEach(child => {
                counter += visibleNodeSubTree(child);
            })
        }
    }
    return counter;
}