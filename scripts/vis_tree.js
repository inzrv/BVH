export class VisTree {
    constructor(tree, k = null) {
        this.tree = tree;
        this.k = k; // Сколько детей у узла максимум
    }
    draw(ctx, ctxWidth, ctxHeight) {
        const levelsNumber = this.tree.root.level + 1; // Количество уровней
        const levelHeight = Math.min(25, ctxHeight / levelsNumber); // Высота одного уровня

        this.drawSubtree(ctx, this.tree.root, 0, ctxWidth, 0, levelHeight); // Начинаем рисовать от корня
    }

    drawSubtree(ctx, node, startX, nodeWidth, startY, levelHeight) {
        if (node) {
            // Рисуем сам узел
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.strokeRect(startX, startY, nodeWidth, levelHeight);
            if (node.visibility) {
                ctx.fillStyle = 'pink';
            }
            else {
                ctx.fillStyle = 'white';
            }
            ctx.fillRect(startX, startY, nodeWidth, levelHeight);
            // Проходим его детей
            if (node.children) {
                const childrenNumber = node.children.length; // Количество детей
                let childWidth = 0;
                if (this.k == null) {
                    childWidth = nodeWidth / childrenNumber;
                }
                else {
                    childWidth = nodeWidth / this.k; // Ширина ребенка
                }
                const childrenStartY = startY + levelHeight; // Начало ребенка по Y
                for (let i = 0; i < childrenNumber; i++) {
                    this.drawSubtree(ctx, node.children[i], startX + i * childWidth, childWidth, childrenStartY, levelHeight);
                }
            }
        }
    }
}