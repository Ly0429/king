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
camera.position.set(-140, 3, 10);

//_-------------------------------------------------------------------
//musica
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();

audioLoader.load("musica.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);   // repetir música
    sound.setVolume(0.5);  // volumen (0 a 1)
});

window.addEventListener("click", () => {
    if (!sound.isPlaying) {
        sound.play();
    }
});


//musica disparo
const sonidoExplosion = new THREE.Audio(listener);

audioLoader.load("explosion.mp3", function (buffer) {
    sonidoExplosion.setBuffer(buffer);
    sonidoExplosion.setVolume(1);
});


//_------------------------------------------------------

let juegoIniciado = false;

const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
    // reproducir sonidos
    sound.play();
    sonidoExplosion.play();

    // ocultar botón
    playBtn.style.display = "none";

    juegoIniciado = true;
});

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

// Cargar textura y configurar para Pixel Art
const texturaMono = loader.load("mono.png");
texturaMono.magFilter = THREE.NearestFilter; // Evita que se vea borroso
texturaMono.minFilter = THREE.NearestFilter;



// Cargar textura de banana
const texturaBanana = loader.load("banana.png"); // Asegúrate de que el archivo exista
texturaBanana.magFilter = THREE.NearestFilter;
texturaBanana.minFilter = THREE.NearestFilter;
//_-----------------------------------------------------------------------------------

// --- Configuración de Animación ---
const totalFrames = 6; // El número de monitos en tu imagen
let frameActual = 0;
let contadorTiempo = 0;
const velocidadAnimacion = 6; // Ajusta esto: menor número = corre más rápido

// IMPORTANTE: Le decimos a Three.js que solo muestre 1/7 de la imagen a la vez
texturaMono.repeat.set(1 / totalFrames, 1);

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

jugador.position.set(-280, 4, 0);
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
bg1.position.set(0, -6, -60);
scene.add(bg1);

// MEDIO
const bg2 = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 100),
    new THREE.MeshBasicMaterial({ map: fondo2, transparent: true })
);
bg2.position.set(0, 0, -50);
scene.add(bg2);

// CERCA
const bg3 = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 100),
    new THREE.MeshBasicMaterial({ map: fondo3, transparent: true })
);
bg3.position.set(0, 0, -50);
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


//-----------------------------------------------------------------
//particulas
const tablas = [];

function crearTablas() {
    for (let i = 0; i < 10; i++) {

        const tabla = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x8b4513 })
        );


        tabla.position.set(jugador.position.x, jugador.position.y, 0);

        // velocidad aleatoria
        tabla.userData.velX = (Math.random() - 0.5) * 0.5;
        tabla.userData.velY = Math.random() * 0.3 + 0.1;
        tabla.userData.rot = Math.random() * 0.2;

        scene.add(tabla);
        tablas.push(tabla);
    }
}

let tablasCreadas = false;


//_----------------------------------------------------------------------------------
//las bananas 

const bananas = [];

function crearBanana(x, y) {
    const banana = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8), // Tamaño grande para compensar la distancia
        new THREE.MeshBasicMaterial({
            map: texturaBanana,
            transparent: true,
            side: THREE.DoubleSide
        })
    );

    // Posición en la capa del fondo bg3
    banana.position.set(x, y, -49.9);


    scene.add(banana);
    bananas.push(banana);
}

function crearFilaBananas(xInicio, y, cantidad, separacion) {
    for (let i = 0; i < cantidad; i++) {
        crearBanana(xInicio + i * separacion, y);
    }
}

// Crear las bananas (ahora sí se ejecutarán correctamente)
crearFilaBananas(-100, 4, 5, 15); // Subí un poco la 'y' para que se vean en los árboles
crearFilaBananas(0, 1, 5, 15);
crearFilaBananas(80, 1, 5, 15);


//-----------------------------------------------------------------------------------
function getVisibleSize() {
    const distancia = camera.position.z;
    const fov = camera.fov * (Math.PI / 180);

    const alto = 2 * Math.tan(fov / 2) * distancia;
    const ancho = alto * camera.aspect;

    return { ancho, alto };
}


//---------------------------------------------------------------------

let cayendoInicio = true;
let velocidadRotacion = 0.3; // qué tan rápido gira
let velocidadX = 0.25;
velocidadY = 0.3;

function animate() {


    requestAnimationFrame(animate);



    if (!juegoIniciado) {
        renderer.render(scene, camera);
        return;
    }



    //las tablas

    tablas.forEach((t, index) => {

        t.userData.velY += gravedad;

        t.position.x += t.userData.velX;
        t.position.y += t.userData.velY;

        t.rotation.z += t.userData.rot;

        // eliminar cuando caen
        if (t.position.y < -10) {
            scene.remove(t);
            tablas.splice(index, 1);
        }
    });

    //las bananas

    bananas.forEach((banana, index) => {

        const dx = jugador.position.x - banana.position.x;
        const dy = jugador.position.y - banana.position.y;
        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia < 3) {
            scene.remove(banana);
            bananas.splice(index, 1);

            console.log("recogida");
        }
    });

    bananas.forEach((banana) => {
        banana.rotation.y += 0.05; // giro bonito
    });

    bananas.forEach((banana, i) => {
        banana.position.y += Math.sin(Date.now() * 0.005 + i) * 0.01;
    });
    // 1. Definimos si el mono se está moviendo (esto faltaba)
    let moviendose = false;

    // 2. Controles
    if (keys["ArrowRight"]) {
        jugador.position.x += 0.3; // Bajé un poco la velocidad (era 1, que es muy rápido)
        jugador.scale.x = 1;
        moviendose = true;
    }
    if (keys["ArrowLeft"]) {
        jugador.position.x -= 0.3;
        jugador.scale.x = -1;
        moviendose = true;
    }

    // 3. Lógica de Animación (ahora sí funcionará 'moviendose')
    if (moviendose && enSuelo) {
        contadorTiempo++;
        if (contadorTiempo % velocidadAnimacion === 0) {
            frameActual = (frameActual + 1) % totalFrames;
            texturaMono.offset.x = frameActual / totalFrames;
        }
    } else if (!enSuelo) {
        // Frame de salto: usamos el frame 5 (el 6to monito)
        texturaMono.offset.x = 5 / totalFrames;
    } else {
        // Si está quieto, volvemos al primer frame
        texturaMono.offset.x = 0;
    }

    // 4. Física: Gravedad y Salto
    velocidadY += gravedad;
    jugador.position.y += velocidadY;

    if (jugador.position.y <= piso.position.y + 2) {
        jugador.position.y = piso.position.y + 2;
        velocidadY = 0;
        enSuelo = true;
    } else {
        enSuelo = false;
    }

    if (keys["Space"] && enSuelo) {
        velocidadY = fuerzaSalto;
        enSuelo = false;
    }



    let posicionDeseada = jugador.position.x;

    //limite camara izquierda
    const limiteCamaraIzq = -140;   // cámara se detiene aquí


    if (posicionDeseada < limiteCamaraIzq) {
        posicionDeseada = limiteCamaraIzq;
    }


    //limite camara derecha

    const limiteCamaraDer = 130;

    if (posicionDeseada > limiteCamaraDer) {
        posicionDeseada = limiteCamaraDer;
    }

    camera.position.x = posicionDeseada;

    //limite jugador izquierda
    const limiteJugadorIzq = -180;  // jugador puede ir más allá

    const limiteIzquierdo = -150;

    if (jugador.position.x < limiteIzquierdo) {
        jugador.position.x = limiteIzquierdo;
    }

    //limite jugador derecha

    const limiteJugadorDer = 150;

    if (jugador.position.x > limiteJugadorDer) {
        jugador.position.x = limiteJugadorDer;
    }

    //_-----------------------------------


    if (cayendoInicio) {

        if (!tablasCreadas) {
            crearTablas();
            tablasCreadas = true;
        }

        if (!sonidoExplosion.isPlaying) {
            sonidoExplosion.play();
        }
        // movimiento horizontal (sale de la casa)
        jugador.position.x += velocidadX;



        // gravedad
        velocidadY += gravedad;
        jugador.position.y += velocidadY;

        // giro
        jugador.rotation.z += 0.3;

        // frame de salto
        texturaMono.offset.x = 5 / totalFrames;

        // cuando toca el piso
        if (jugador.position.y <= piso.position.y + 2) {
            jugador.position.y = piso.position.y + 2;
            velocidadY = 0;

            jugador.rotation.z = 0;

            cayendoInicio = false;
        }

    } else {
        // 🎮 controles normales
        if (keys["ArrowRight"]) {
            jugador.position.x += 0.3;
            jugador.scale.x = 1;
        }
        if (keys["ArrowLeft"]) {
            jugador.position.x -= 0.3;
            jugador.scale.x = -1;
        }

        velocidadY += gravedad;
        jugador.position.y += velocidadY;
    }



    // 5. Cámara y Parallax

    bg1.position.x = camera.position.x * 0.95;
    bg2.position.x = camera.position.x * 0.7;
    bg3.position.x = camera.position.x * 0.4;

    renderer.render(scene, camera);
}

animate();