import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

//----------------------------------------------------------------------
// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

//----------------------------------------------------------------------
// Camara
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 3, 10);


//----------------------------------------------------------------------
// Renderizado
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const luz = new THREE.DirectionalLight(0xffffff, 1);
luz.position.set(10, 20, 10);
scene.add(luz);

const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(luzAmbiente);
//----------------------------------------------------------------------
//objetos
const loader = new THREE.TextureLoader();

const texturaMono = loader.load("mono.png"); // o cangre.gif

const fondo1 = loader.load("selva1.png"); // pagina 1
const fondo2 = loader.load("selva2.png"); // pagina 2
const fondo3 = loader.load("selva3.png"); // pagina 3

fondo1.colorSpace = THREE.SRGBColorSpace;
fondo2.colorSpace = THREE.SRGBColorSpace;
fondo3.colorSpace = THREE.SRGBColorSpace;

const jugador = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshBasicMaterial({
        map: texturaMono,
        transparent: true,
        side: THREE.DoubleSide
    })
);

jugador.position.set(0, 2, 0);
scene.add(jugador);

//--------------------------------------------------------------------
//pantalla adaptable
window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//----------------------------------------------------------------------


// LEJOS
const bg1 = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 150),
    new THREE.MeshBasicMaterial({ map: fondo1 })
);
bg1.position.set(0, -9, -60);
scene.add(bg1);

// MEDIO
const bg2 = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 100),
    new THREE.MeshBasicMaterial({ map: fondo2, transparent: true })
);
bg2.position.set(0, 5, -50);
scene.add(bg2);

// CERCA
const bg3 = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 100),
    new THREE.MeshBasicMaterial({ map: fondo3, transparent: true })
);
bg3.position.set(0, -4.5, -50);
scene.add(bg3);



//------------------------------------------------------
//piso

const piso = new THREE.Mesh(
    new THREE.BoxGeometry(200, 1, 10),
    new THREE.MeshBasicMaterial({ color: 0x000000, visible: false }) // invisible
);

piso.position.set(0, -3, 0);
scene.add(piso);

//-------------------------------------------------------

const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});




//-----------------------------------------------------
//colisiones
const pisos = [piso];



// movimiento
let velocidadY = 0;
const gravedad = -0.01;
const fuerzaSalto = 0.3;
const velocidadCaminar = 1;
let enSuelo = false;


//-----------------------------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);

    const anchoFondo = 100;
    // Controles
    if (keys["ArrowRight"]) {
        jugador.position.x += velocidadCaminar;
        jugador.scale.x = 1; // Mirar a la derecha
    }
    if (keys["ArrowLeft"]) {
        jugador.position.x -= velocidadCaminar;
        jugador.scale.x = -1; // Mirar a la izquierda
    }

    // gravedad
    velocidadY += gravedad;
    jugador.position.y += velocidadY;

    //  Detección del piso
    if (jugador.position.y <= piso.position.y + 2) { 
        jugador.position.y = piso.position.y + 2;
        velocidadY = 0;
        enSuelo = true;
    } else {
        enSuelo = false;
    }

    // Salto
    if (keys["Space"] && enSuelo) {
        velocidadY = fuerzaSalto;
        enSuelo = false;
    }

    // Cámara sigue al jugador
    camera.position.x = jugador.position.x;
    
    // Parallax 
    bg1.position.x = camera.position.x * 0.9; 
    bg2.position.x = camera.position.x * 0.7;
    bg3.position.x = camera.position.x * 0.4;

    renderer.render(scene, camera);
}

animate();