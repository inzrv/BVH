import { minOBB, OBBForOBBs, OBBForTriangle } from "../volumes/obb.js";
import { comparePointsXY, Point } from "../math/point.js";
import { Tree, Node } from "./tree.js";
import { MAX_X, MAX_Y } from "../scene/constants.js";

export class OBBTree extends Tree{
    buildUp(mesh) {
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(OBBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
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
                    const parentOBB = OBBForOBBs(children[i].volume, children[i].volume);
                    parentNode = new Node (parentOBB, null, [children[i]], children[i].level + 1);
                    used[i] = true;
                }
                else { // Если нашли ближайшний узел
                    const parentOBB = OBBForOBBs(children[i].volume, children[nearestNodeNumber].volume);
                    parentNode = new Node (parentOBB, null, [children[i], children[nearestNodeNumber]], children[i].level + 1);
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
            leaves.push(new Node(OBBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        OBBNodesSort(leaves);
        const h = Math.ceil(Math.log(mesh.length) / Math.log(2));
        this.root = this.buildChild(leaves, h);
    }

    buildChild(descendants, level) { // descendants – массив объектов типа Node
        if (descendants.length == 1) {
            return descendants[0];
        }
        let allVertices = [];
        descendants.forEach((desc) => {
            desc.volume.vertices.forEach((vertex) => {
                allVertices.push(vertex);
            })
        });
        let curOBB = minOBB(allVertices); // Построили OBB по вершинам всех потомков
        let curNode = new Node(curOBB, null, [], level); //Построили узел
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
    const mid = new Point((node.volume.vertices[0].x + node.volume.vertices[2].x) / 2 , 
        (node.volume.vertices[0].y + node.volume.vertices[2].y) / 2);
    let minDst = MAX_X + MAX_Y;
    let minNumber = -1;
    for (let i = 0; i < allNodes.length; i++) {
        if (i != nodeNumber && used[i] == false) {
            let curMid = new Point((allNodes[i].volume.vertices[0].x + allNodes[i].volume.vertices[2].x) / 2 , 
                (allNodes[i].volume.vertices[0].y + allNodes[i].volume.vertices[2].y) / 2);
            let curDst = Math.sqrt((curMid.x - mid.x) * (curMid.x - mid.x) + (curMid.y - mid.y) * (curMid.y - mid.y));
            if (curDst < minDst) {
                minDst = curDst;
                minNumber = i;
            }
        }
    }
    return minNumber;
}

export function compareOBBNodes(node1, node2){
    const midX1 = (node1.volume.vertices[0].x + node1.volume.vertices[2].x) / 2;
    const midY1 = (node1.volume.vertices[0].y + node1.volume.vertices[2].y) / 2;
    const midX2 = (node2.volume.vertices[0].x + node2.volume.vertices[2].x) / 2;
    const midY2 = (node2.volume.vertices[0].y + node2.volume.vertices[2].y) / 2;

    const mid1 = new Point(midX1, midY1);
    const mid2 = new Point(midX2, midY2);

    return comparePointsXY(mid1, mid2);
}

function OBBNodesSort(nodes) {
    nodes.sort(compareOBBNodes);
}