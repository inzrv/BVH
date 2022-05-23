import { Camera } from "./camera.js";
import { AABBTree } from "./trees/aabb_tree.js";
import { VisTree } from "./vis_tree.js";
import { leavesArea, visibleNodesNumber, cost } from "./trees/tree.js";
import { OBBTree } from "./trees/obb_tree.js";
import { meshArea, Scene } from "./scene/scene.js";

const sceneCanvas = document.getElementById('scene');
const sceneContext = sceneCanvas.getContext('2d'); 
const sceneFillColor = 'rgb(65, 65, 65)';

function sceneCanvasClear() {
    sceneContext.fillStyle = sceneFillColor;
    sceneContext.fillRect(0, 0, sceneCanvas.clientWidth, sceneCanvas.clientHeight);
}

const treeCanvas = document.getElementById('tree');
const treeContext = treeCanvas.getContext('2d'); 
const treeFillColor = 'rgb(65, 65, 65)';
function treeCanvasClear() { 
    treeContext.fillStyle = treeFillColor;
    treeContext.fillRect(0, 0, treeCanvas.clientWidth, treeCanvas.clientHeight);
}

let scene = {};
let sceneReady = false;

let tree = {};
let treeReady = false;

let visTree = {};

let lArea = 0; // Суммарная площадь всех узлов
let mArea = 0; // Cуммарная площадь всех треугольников
let treeHeight = 0; // Высота дерева
let polyNumber = 0; // Количество полигонов
let treeCost = 0; // Стоимость дерева

let buildStart = 0; // Время начала построения дерева
let buildEnd = 0; // Время конца построения дерева

let updateStart = 0; // Время начала обновления сцены
let updateEnd = 0; // Время конца обновления сцены

let iterationMod50 = 0; // Для более понятного отображения времени


// Обработка загрузки сцены
document.getElementById('fileSelector').addEventListener('change', (event) => {
    const file = event.target.files[0];
    document.getElementById('fileName').innerHTML = file.name;
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() { // Если сцена загружена
        dropAll();
        refreshInfo(); // Обновляем информацию на экране
        logPrint("Scene loaded successfully!", false);
        sceneInit(reader.result);
    }
    reader.onerror = function() {
        logPrint("File upload error!", true);
        sceneReady = false;
    };
}); 

// Инициализация сцены
function sceneInit(str){
    scene = new Scene();
    scene.build(str);
    // Если построение мэша прошло успешно
    sceneReady = true;
    mArea = meshArea(scene.polygons);
    polyNumber = scene.getSize();
}


function sceneUpdate() {
    scene.polygons.forEach(poly => {
        poly.update(camera);
    })
}

function setInvisibleScene() {
    scene.polygons.forEach(poly => {
        poly.visibility = false;
    })

}

// Работа с камерой
const angleRange = document.getElementById('angleRange');
const distanceRange = document.getElementById('distanceRange');

let camera = new Camera((Number(angleRange.value) / 180) * Math.PI, Number(distanceRange.value), 100, 100, 0);
let cameraVis = false;
cameraInit();

function cameraInit(){
    const angleRange = document.getElementById('angleRange');
    const distanceRange = document.getElementById('distanceRange');
    let curX = 100;
    let curY = 100;
    let curA = 0;
    if (camera != null) { // Если камера уже есть
        curX = camera.pyramid.vertices[0].x;
        curY = camera.pyramid.vertices[0].y;
        curA = camera.getAngle();
    }
    camera = new Camera((Number(angleRange.value) / 180) * Math.PI, Number(distanceRange.value), curX, curY, curA);
}

document.getElementById('cameraCheck').addEventListener('click', () => {
    cameraVis = cameraCheck.checked;
});

// Принятие настроек камеры
document.getElementById('applyButton').addEventListener('click', ()=> {
    cameraInit();
})

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

let treeViewMode = document.getElementById('viewMode').selectedIndex; // Как отображаем дерево внутри сцены

// Обработка нажатия на кнопку "Построить дерево"
document.getElementById('buildButton').addEventListener('click', treeInit);

// Удаление дерева
document.getElementById('deleteButton').addEventListener('click', ()=> {
    tree = {};
    treeReady = false;
    treeCost = 0;
    lArea = 0;
    treeHeight = 0;
    sceneCanvasClear();
    treeCanvasClear();
})

function treeInit(){
    if (sceneReady) {
        const volumeSelect = document.getElementById('bvSelect').selectedIndex; // Какой объем выбран
        const buildStrategySelect = document.getElementById('buildStrategy').selectedIndex; // Как строим

        if (volumeSelect == 0) {
            tree = new AABBTree();
        }
        else {
            tree = new OBBTree();
        }

        if (buildStrategySelect == 0) {

            buildStart = performance.now(); // Начало отсчета времени выполнения 
            tree.buildDown(scene.polygons);
            buildEnd = performance.now(); 

        }
        else {
            buildStart = performance.now(); 
            tree.buildUp(scene.polygons);
            buildEnd = performance.now();
        }

        treeReady = true;

        lArea = leavesArea(tree);
        treeHeight = tree.root.level + 1;
        treeCost = cost(tree);
        visTree = new VisTree(tree, 2);
    }
    else {
        // Попытка создания дерева без сцены
        console.log('Сцена не загружена!');
    }
}


function process() {
    requestAnimationFrame(process);
    sceneCanvasClear();
    treeCanvasClear();
    refreshInfo();
    iterationMod50 = (iterationMod50 + 1) % 50;
    if (cameraVis) {
        camera.update();
        if (sceneReady) {
            if (treeReady) {
                updateStart = performance.now();
                tree.update(camera);
                updateEnd = performance.now();
                tree.draw(sceneContext, treeViewMode);
                visTree.draw(treeContext, treeCanvas.clientWidth, treeCanvas.clientHeight);
            }
            else {
                updateStart = performance.now();
                sceneUpdate();
                updateEnd = performance.now();
            }
            scene.draw(sceneContext);
        }
        camera.draw(sceneContext);
        cameraMoveProcess();
    }
    else {
        if (sceneReady) {
            setInvisibleScene();
            if (treeReady) {
                tree.setInvisibleTree();
                tree.draw(sceneContext, treeViewMode);
                visTree.draw(treeContext, treeCanvas.clientWidth, treeCanvas.clientHeight);
            }
            scene.draw(sceneContext);
        }
    }
}   

process();

function cameraMoveProcess(){
    if (camera.getPos().x <= 0 && keys.left.pressed) {
        camera.velocity.x = 0;
    }
    else {
        if (camera.getPos().x >= sceneCanvas.clientWidth && keys.right.pressed) {
            camera.velocity.x = 0;
        }
        else {
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

        }
    }
    if (camera.getPos().y <= 0 && keys.up.pressed) {
        camera.velocity.y = 0;
    }
    else {
        if (camera.getPos().y >= sceneCanvas.clientHeight && keys.down.pressed) {
            camera.velocity.y = 0;
        }
        else {
            if (keys.down.pressed) {
                camera.velocity.y = camera.speed;
            }
            else {
                if (keys.up.pressed) {
                    camera.velocity.y = -camera.speed;
                }
                else {
                    camera.velocity.y = 0;
                }
            }
        }
    }
}


function refreshInfo() {
    document.getElementById("polyNumber").innerHTML = polyNumber;
    // document.getElementById("meshArea").innerHTML = mArea.toFixed(2);
    // document.getElementById("leavesArea").innerHTML = lArea.toFixed(2);
    document.getElementById("treeHeight").innerHTML = treeHeight;
    document.getElementById("costFunction").innerHTML = treeCost.toFixed(2);
    treeViewMode = document.getElementById('viewMode').selectedIndex; // Как отображаем дерево внутри сцены
    if (iterationMod50 == 0) {
        document.getElementById("updateTime").innerHTML = (updateEnd - updateStart).toFixed(2) + ' ms';
    }
    if (treeReady) {
        // document.getElementById("visNodesNumber").innerHTML = visibleNodesNumber(tree);
        document.getElementById("fitFactor").innerHTML = (mArea / lArea).toFixed(2);
        document.getElementById("buildTime").innerHTML = (buildEnd - buildStart).toFixed(2) + ' ms';
    }
    else {
        document.getElementById("buildTime").innerHTML = "unknown";
       // document.getElementById("visNodesNumber").innerHTML = 0;
        document.getElementById("fitFactor").innerHTML = "unknown";
    }
}

function logPrint(text, isError) {
    document.getElementById("messages").innerHTML = text;
    if (isError) {
        document.getElementById("messages").style.color = 'rgb(180, 142, 123)';
    }
    else {
        document.getElementById("messages").style.color = 'rgb(114, 134, 86)';
    }
}

function dropAll(){
    scene = {};
    tree = {};
    sceneReady = false;
    treeReady = false;
    lArea = 0;
    mArea = 0;
    treeHeight = 0;
    polyNumber = 0;
    sceneCanvasClear();
    treeCanvasClear();
}


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
    if (e.clientY - sceneCanvas.offsetTop > sceneCanvas.clientHeight ||
        e.clientX - sceneCanvas.offsetLeft > sceneCanvas.clientWidth ||
        e.clientX < sceneCanvas.offsetLeft || e.clientY < sceneCanvas.offsetTop) {
        return;
    }
    let deltaY = camera.pyramid.vertices[0].y - (e.clientY - sceneCanvas.offsetTop);
    let deltaX = (e.clientX - sceneCanvas.offsetLeft) - camera.pyramid.vertices[0].x;
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
        return;
    }
    let theta = Math.atan(deltaY / deltaX);

    if (deltaX < 0 && Math.abs(deltaY) < 0.00001) {
        theta = Math.PI;
    }
    else {
        if (deltaX < 0 && deltaY > 0) {
            theta += Math.PI;
        }
        else {
            if (deltaX < 0 && deltaY < 0) {
               theta -= Math.PI;
            }
        }
    }
    let deltaA = theta - camera.getAngle();
    camera.rotate(deltaA);
});