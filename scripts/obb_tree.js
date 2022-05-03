import { MAX_X, MAX_Y } from "./constants.js";
import { minOBB, OBB, OBBForOBBs, OBBForTriangle } from "./obb.js";
import { comparePointsXY, Point } from "./point.js";
import { Tree, Node } from "./tree.js";

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

export class OBBTree extends Tree{
    buildUp(mesh) {
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(OBBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        OBBNodesSort(leaves);
        this.root = this.buildParentsUp(leaves);
    }

    buildParentsUp(children) {
        let i = 0;
        let n = children.length;
        if (n == 1) {
            return children[0];
        }
        let parents = []; // Массив для родителей
        while(i < n) {
            let parentNode = {};
            if (i + 1 < n) {
                const parentOBB = OBBForOBBs(children[i].volume, children[i + 1].volume);
                parentNode = new Node (parentOBB, null, [children[i], children[i + 1]], children[i].level + 1);
            }
            else {
                const parentOBB = OBBForOBBs(children[i].volume, children[i].volume);
                parentNode = new Node (parentOBB, null, [children[i]], children[i].level + 1);
            }
            parents.push(parentNode);
            i += 2;
        }
        return this.buildParentsUp(parents);
    }

    buildDown(mesh) {
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(OBBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        OBBNodesSort(leaves);
        this.root = this.buildChild(leaves, 1);
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
            mid =  Math.floor(descendants.length / 2);
        }
        let leftDesc = descendants.slice(0, mid);
        let rightDesc = descendants.slice(mid, descendants.length);
        let leftChild = this.buildChild(leftDesc, level + 1);
        let rightChild = this.buildChild(rightDesc, level + 1);
        curNode.children.push(leftChild);
        curNode.children.push(rightChild);
        return curNode;
    }

    buildTest(mesh, ctx){
        const leaves = []; // Массив для листов (объекты класса Node)
        let busyNodes = []; // Массив уже рассмотренных узлов

        mesh.forEach(meshTriangle => {
            leaves.push(new Node(OBBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
            busyNodes.push(false);
        });


        const nearest = nearestNode(0, leaves, busyNodes, ctx);
        leaves[0].volume.draw(ctx, 1, 'red', 'rgba(255, 0, 0, 0.1)');
        leaves[nearest].volume.draw(ctx, 1, 'red', 'rgba(255, 0, 0, 0.1)');

        leaves.forEach(leaf => {
            leaf.draw(ctx);
        })
    }


    buildParentsNearestUp(children){
        let i = 0; // Количество рассмотренных детей
        let n = children.length;

        let busyNodes = [];
        for (let j = 0; j < n; j++) {
            busyNodes.push(false);
        }

        if (n == 1) {
            return children[0];
        }
        let parents = []; // Массив для родителей
        while (i < n) {
            let parentNode = {};
            let nearest = nearestNode(i, children, busyNodes);
            if (nearest == -1) {
                const parentOBB = minOBB(children[i].volume.vertices);
                parentNode = new Node(parentOBB, null, [children[i]], children[i].level + 1);
            }
            else {
                busyNodes[nearest] = true;
                busyNodes[i] = true;
                const parentOBB = minOBB(children[i].volume.vertices, children[nearest].volume.vertices);
                parentNode = new Node (parentOBB, null, [children[i], children[nearest]], children[i].level + 1);

            }
            parents.push(parentNode);
            i++;
        }
        return this.buildParentsUp(parents);
    }

    buildNearestUp(mesh) {
        const leaves = []; // Массив для листов (объекты класса Node)
        mesh.forEach(meshTriangle => {
            leaves.push(new Node(OBBForTriangle(meshTriangle.triangle), meshTriangle, null, 0));
        });
        this.root = this.buildParentsNearestUp(leaves);
    }
}


function nearestNode(mainNodeNumber, allNodes, busyNodes) {
    const n = allNodes.length;
    if (n == 0) {
        return -1;
    }
    let min = MAX_X + MAX_Y;
    let minNumber = -1;
    const mainNode = allNodes[mainNodeNumber];
    const mid = new Point(Math.abs(mainNode.volume.vertices[0].x + mainNode.volume.vertices[2].x) / 2,
        Math.abs(mainNode.volume.vertices[0].y + mainNode.volume.vertices[2].y) / 2);
    for (let i = 0; i < n; i++){
        if (mainNodeNumber != i && busyNodes[i] != true) {
            const curMid = new Point(
                Math.abs(allNodes[i].volume.vertices[0].x + allNodes[i].volume.vertices[2].x) / 2,
                Math.abs(allNodes[i].volume.vertices[0].y + allNodes[i].volume.vertices[2].y) / 2
            );
            const curDst = Math.sqrt((curMid.x - mid.x) * (curMid.x - mid.x) + (curMid.y - mid.y) * (curMid.y - mid.y));
            if (curDst < min) {
                min = curDst;
                minNumber = i;
            }
        }
    }
    return minNumber;
}