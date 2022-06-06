export class VisTree {
    constructor(tree, k = null) {
        this.tree = tree;
        this.k = k; // Сколько детей у узла максимум
    }
    draw(ctx, ctxWidth, ctxHeight) {
        const levelsNumber = this.tree.root.level + 1; // Количество уровней
        const levelHeight = Math.min(25, ctxHeight / levelsNumber); // Высота одного уровня
        let maxWidth = ctxWidth;
        let startX = 0;
        if (levelsNumber < 5) {
            maxWidth *= 0.6;
            startX = ctxWidth * 0.2;
        } 
        this.drawSubtree(ctx, this.tree.root, startX, maxWidth, 0, levelHeight); // Начинаем рисовать от корня
    }

    drawNode(ctx, node, startX, nodeWidth, startY, levelHeight) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '';
        let fontColor = 'rgb(65, 65, 65)';
        ctx.strokeRect(startX, startY, nodeWidth, levelHeight);
        if (node.visibility) {
            ctx.fillStyle = 'rgb(203, 203, 203)';
        }
        else {
            ctx.fillStyle = 'rgb(65, 65, 65)';
            fontColor = 'rgb(203, 203, 203)';
        }
        ctx.fillRect(startX, startY, nodeWidth, levelHeight);

        if (nodeWidth > 100) { // Записываем координаты
            ctx.fillStyle = fontColor;
            ctx.font = '12px Arial';
            const min = node.volume.getMinPoint();
            const max = node.volume.getMaxPoint();
            let strMin = '[' + min.x.toFixed(0) + ' ; ' + min.y.toFixed(0) + ']';
            let strMax = '[' + max.x.toFixed(0) + ' ; ' + max.y.toFixed(0) + ']';

            ctx.fillText(strMin, startX + 5,  startY + 15);
            ctx.fillText(strMax, startX + nodeWidth - 60,  startY + 15);

        }
    }

    drawSubtree(ctx, node, startX, nodeWidth, startY, levelHeight) {
        if (node) {
            if (nodeWidth > 4) {
            // Рисуем сам узел
                this.drawNode(ctx, node, startX, nodeWidth, startY, levelHeight);
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
}