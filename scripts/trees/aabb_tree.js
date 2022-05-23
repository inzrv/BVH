import { AABBForAABBs, AABBForTriangle, minAABB } from "../volumes/aabb.js";
import { MAX_X, MAX_Y } from "../scene/constants.js";
import { comparePointsXY, Point } from "../math/point.js";
import { Tree, Node } from "./tree.js";

export class AABBTree extends Tree {

    buildUp(mesh) { // Построить дерево снизу вверх. При выборе пары ищем ближайшего
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(AABBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        this.root = this.buildParentsUp(leaves);
    }

    buildParentsUp(children) {
        let i = 0;
        let n = children.length;
        if (n == 1) {
            return children[0];
        }
        let parents = []; // Массив для родителей
        let used = []; // Массив для неиспользованных узлов
        for (let j = 0; j < n; j++) { // Изначально не использовали никаких узлов
            used.push(false);
        }
        while (i < n) {
            if (used[i] == true) { // Если ребенка с номером i мы уже рассмторели
                i++;
            }
            else { // Если у этого ребенка нет родителей
                let parentNode = {};
                let nearestNodeNumber = findNearestNode(i, children, used);
                if (nearestNodeNumber == -1) { // Если не нашли ближайшего узла, значит оставался последним
                    const parentAABB = AABBForAABBs(children[i].volume, children[i].volume);
                    parentNode = new Node (parentAABB, null, [children[i]], children[i].level + 1);
                    used[i] = true;
                }
                else { // Если нашли ближайшний узел
                    const parentAABB = AABBForAABBs(children[i].volume, children[nearestNodeNumber].volume);
                    parentNode = new Node (parentAABB, null, [children[i], children[nearestNodeNumber]], children[i].level + 1);
                    used[i] = true;
                    used[nearestNodeNumber] = true;
                }
                parents.push(parentNode);
                i++;
            }

        }
        return this.buildParentsUp(parents);
    }

    buildDown(mesh) {
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(AABBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        AABBNodesSort(leaves);
        const h = Math.ceil(Math.log(mesh.length) / Math.log(2));
        this.root = this.buildChild(leaves, h);
    }


    // Построение поддерева на узлах descendants 
    buildChild(descendants, level) { // descendants – массив объектов типа Node
        if (descendants.length == 1) {
            return descendants[0];
        }
        let allVertices = [];
        descendants.forEach((desc) => {
            allVertices.push(desc.volume.max);
            allVertices.push(desc.volume.min);
        });
        let curAABB =  minAABB(allVertices); // Построили AABB по вершинам всех потомков
        let curNode = new Node(curAABB, null, [], level); //Построили узел
        let mid = 0;
        // Делим потомков пополам
        if (descendants.length % 2 == 0) {
            mid = descendants.length / 2;
        }
        else {
            //mid =  Math.floor(descendants.length / 2);
            mid =  Math.ceil(descendants.length / 2);
        }
        let leftDesc = descendants.slice(0, mid);
        let rightDesc = descendants.slice(mid, descendants.length);
        let leftChild = this.buildChild(leftDesc, level - 1);
        let rightChild = this.buildChild(rightDesc, level - 1);
        curNode.children.push(leftChild);
        curNode.children.push(rightChild);
        return curNode;
    }

}

function findNearestNode(nodeNumber, allNodes, used) {
    const node = allNodes[nodeNumber];
    const mid = new Point((node.volume.min.x + node.volume.max.x) / 2 , (node.volume.min.y + node.volume.max.y) / 2);
    let minDst = MAX_X + MAX_Y;
    let minNumber = -1;
    for (let i = 0; i < allNodes.length; i++) {
        if (i != nodeNumber && used[i] == false) {
            let curMid = new Point((allNodes[i].volume.min.x + allNodes[i].volume.max.x) / 2 , 
                (allNodes[i].volume.min.y + allNodes[i].volume.max.y) / 2);
            let curDst = Math.sqrt((curMid.x - mid.x) * (curMid.x - mid.x) + (curMid.y - mid.y) * (curMid.y - mid.y));
            if (curDst < minDst) {
                minDst = curDst;
                minNumber = i;
            }
        }
    }
    return minNumber;
}

export function compareAABBNodes(node1, node2){
    const midX1 = (node1.volume.min.x + node1.volume.max.x) / 2;
    const midY1 = (node1.volume.min.y + node1.volume.max.y) / 2;
    const midX2 = (node2.volume.min.x + node2.volume.max.x) / 2;
    const midY2 = (node2.volume.min.y + node2.volume.max.y) / 2;

    const mid1 = new Point(midX1, midY1);
    const mid2 = new Point(midX2, midY2);

    return comparePointsXY(mid1, mid2);
}

function AABBNodesSort(nodes) {
    nodes.sort(compareAABBNodes);
}