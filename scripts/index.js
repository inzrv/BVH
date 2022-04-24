import { Point } from "./point.js";
import { MTriangle } from "./m_triangle.js";
import { Camera } from "./camera.js";
import { AABBTree } from "./aabb_tree.js";
import { VisTree } from "./vis_tree.js";
import { pointInAABB, pointInTriangle, triangleAABBIntersection } from "./collision.js";
import { Triangle } from "./triangle.js";
import { AABB } from "./aabb.js";

const sceneCanvas = document.getElementById('scene');
const sceneContext = sceneCanvas.getContext('2d'); 
const sceneFillColor = 'white';

const treeCanvas = document.getElementById('tree');
const treeContext = treeCanvas.getContext('2d'); 
const treeFillColor = 'white';

// Отслеживание нажатия и отпускания клавиш
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    up: {
        pressed: false
    },
    down: {
        pressed: false
    }
 }


 let mesh = [];

 mesh.push(new MTriangle([new Point(10, 10), new Point(70, 20), new Point(100, 50)]));
 mesh.push(new MTriangle([new Point(120, 10), new Point(140, 10), new Point(130, 30)]));
 mesh.push(new MTriangle([new Point(200, 30), new Point(220, 50), new Point(210, 70)]));
 mesh.push(new MTriangle([new Point(50, 100), new Point(80, 90), new Point(70, 120)]));
 mesh.push(new MTriangle([new Point(40, 60), new Point(55, 65), new Point(48, 70)]));
 mesh.push(new MTriangle([new Point(300, 20), new Point(330, 30), new Point(345, 70)]));
 mesh.push(new MTriangle([new Point(300, 280), new Point(330, 280), new Point(345, 295)]));
 mesh.push(new MTriangle([new Point(345, 295), new Point(360, 270), new Point(330, 250)]));




 const T = new AABBTree();
 T.build(mesh);

 const VT = new VisTree(T, 2);

 let camera = new Camera(0.7, 5);


 function process() {
    requestAnimationFrame(process);
    sceneContext.fillStyle = sceneFillColor;
    sceneContext.fillRect(0, 0, sceneCanvas.width, sceneCanvas.height);

    T.update(camera);
    T.draw(sceneContext);

    mesh.forEach(meshTriangle => {
        meshTriangle.draw(sceneContext);
    });
   
    VT.draw(treeContext, treeCanvas.clientWidth, treeCanvas.clientHeight);

    camera.draw(sceneContext);
    camera.update();

    if (keys.left.pressed) {
       camera.velocity.x = -camera.speed;
    }
    else {
        if (keys.right.pressed) {
            camera.velocity.x = camera.speed;
        }
        else {
            camera.velocity.x = 0;
        }
    }

    if (keys.down.pressed) {
        camera.velocity.y = camera.speed;
    }
    else {
        if (keys.up.pressed) {
            camera.velocity.y = -camera.speed;
        }
        else{
            camera.velocity.y = 0;
        }
    }
}   

process();


 window.addEventListener('keyup', ({key}) => { // Обработка отпускания клавиши
    switch(key) {
       case 'd':
            keys.right.pressed = false; 
            break;
        case 'a':
            keys.left.pressed = false;
            break;
        case 's':
            keys.down.pressed = false;
            break;
        case 'w':
            keys.up.pressed = false;
            break;
    }
 });

 window.addEventListener('keydown', ({key}) => { // Обработка нажатия клавиши
    switch(key) {
        case 'a':
            keys.left.pressed = true;
            break;
       case 'd':
            keys.right.pressed = true;
            break;
       case 'w':
            keys.up.pressed = true;
            break;
       case 's':
            keys.down.pressed = true;
            break;
    }
});

window.addEventListener('mousemove', function(e) { // отслеживание поворота камеры
    let delta_y = e.clientY - sceneCanvas.offsetTop - camera.pyramid.vertices[0].x;
    let delta_x = e.clientX - sceneCanvas.offsetLeft - camera.pyramid.vertices[0].y;
    let theta = - Math.atan(delta_y / delta_x);
    if (delta_y >= 0 && delta_x <= 0) {
            theta -= Math.PI;
    }
    if (delta_y < 0 && delta_x < 0) {
        theta += Math.PI;
    }
    camera.rotate(theta - camera.angle);
});
