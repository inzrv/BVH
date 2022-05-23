// Вершины упорядочены! 
export class Polygon {
    constructor (vertices) {
        this.vertices = vertices;
    }
    draw(ctx, lWidth, sStyle,  fStyle) {
        ctx.lineWidth = lWidth;
        ctx.strokeStyle = sStyle;
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
        if (fStyle) {
            ctx.fillStyle = fStyle;
            ctx.fill();
        }
        ctx.stroke();
    }
}