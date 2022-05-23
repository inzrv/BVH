import { AABB } from "../volumes/aabb.js";
import { triangleAABBIntersection, triangleOBBIntersection } from "../collision.js";
import { OBB } from "../volumes/obb.js";

export class Node {
    constructor(volume, meshTriangle, children, level){
        this.volume = volume;
        this.visibility = false;
        this.children = children;
        this.meshTriangle = meshTriangle;
       // this.visNode = null; // Ссылка на узел визуализируемого дерева
        this.level = level; // 0 – лист, 1 – родитель листа, ...
    }
    draw(ctx) {
        if (this.level < 5) {
            return;
        }
        if (this.visibility) {
            this.volume.draw(ctx, 1, 'black', 'rgba(255, 255, 255, 0.3)');
        }
        else {
            this.volume.draw(ctx, 0.5, 'black', null);
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

    setInvisibleTree(){
        this.setInvisibleSubTree(this.root);
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

    draw(ctx, mode){ // Рисуем дерево в контексте ctx
        if (mode != 2) { // Если отображаем дерево
            this.drawSubTree(ctx, this.root, mode);
        }
    }

    drawSubTree(ctx, node, mode) { // Рисуем поддерево с корнем в node
        if (mode == 1) { // Если рисуем только видимые
            if (node && node.visibility) {
                node.draw(ctx);
            }
            if (node.children) {
                node.children.forEach(child => {
                    this.drawSubTree(ctx, child, mode);
                });
            }
        }
        else { // Если рисуем все
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

export function leavesArea(tree){
    return leavesInSubTreeArea(tree.root);
}

export function leavesInSubTreeArea(node) { // Сумма площадей листьев в поддереве
    if (node.level == 0) { // Если это лист
        return node.volume.area(); // Возвращаем его площадь
    }
    else {
        if (node.children) {
            let sumArea = 0;
            node.children.forEach(child => {
                sumArea += leavesInSubTreeArea(child);
            })
            return sumArea;
        }
    }
}

export function cost(tree){
    if (tree.root) {
        return costSubTree(tree.root) / 1000;   
    }
    return 0;
}

export function costSubTree(node) {
    if (node) {
        if (node.children) {
            let childCost = 0;
            node.children.forEach(child => {
                childCost += costSubTree(child);
            })
            return node.volume.area() * node.children.length + childCost;
        }
        else { // Если это лист
            return 0;
        }
    }
}