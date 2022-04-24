import { AABBForAABBs, AABBForTriangle } from "./aabb.js";
import { Tree, Node } from "./tree.js";

export class AABBTree extends Tree {
    build(mesh) {
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(AABBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        AABBNodesSort(leaves);
        this.root = this.buildParents(leaves);
    }

    buildParents(children) {
        let i = 0;
        let n = children.length;
        if (n == 1) {
            return children[0];
        }
        let parents = []; // Массив для родителей
        while(i < n) {
            let parentNode = {};
            if (i + 1 < n) {
                const parentAABB = AABBForAABBs(children[i].volume, children[i + 1].volume);
                parentNode = new Node (parentAABB, null, [children[i], children[i + 1]], children[i].level + 1);
            }
            else {
                const parentAABB = AABBForAABBs(children[i].volume, children[i].volume);
                parentNode = new Node (parentAABB, null, [children[i]], children[i].level + 1);
            }
            parents.push(parentNode);
            i += 2;
        }
        return this.buildParents(parents);
    }
}

function AABBNodesSort(nodes){ // Сортировка массива объектов типа Nodes
    nodes.sort(compareAABBNodes);
}

function compareAABBNodes(node1, node2) { // Сравнение двух AABB: по возрастанию X, по возрастанию Y координаты левого верхнего угла
    if (node1.volume.min.x < node2.volume.min.x) { // если первая коробка левее
        return -1;
    }
    if (node1.volume.min.x > node2.volume.min.x) { //если вторая коробка левее
        return 1;
    }
    return (node1.volume.min.y - node2.volume.min.y); // если координаты x равны, то сравниваем по y
}