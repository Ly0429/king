import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

//----------------------------------------------------------------------
// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camara
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 4, 16);
//-------------------------------------------------------------------------

// Renderizado
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const luz = new THREE.DirectionalLight(0xffffff, 1);
luz.position.set(10, 20, 10);
scene.add(luz);

const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(luzAmbiente);

//---------------------------------------------------------------------------------


//_-------------------------------------------------------------------------------
const loader = new THREE.TextureLoader();

const fondo1 = loader.load("selva1.png");
const fondo2 = loader.load("selva2.png");

// capa lejana
const bg1 = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 100),
    new THREE.MeshBasicMaterial({ map: fondo1 })
);
bg1.position.set(0, 0, -50);
scene.add(bg1);

// capa cercana
const bg2 = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 100),
    new THREE.MeshBasicMaterial({ map: fondo2, transparent: true })
);
bg2.position.set(0, 0, -30);
scene.add(bg2);

//--------------------------------------------------------------------------------

const musica = document.createElement("audio");
musica.src = "cancion.mp3";
musica.loop = true;
musica.volume = 0.5;


document.addEventListener("click", () => {
    musica.play();
});

//-----------------------------------------------

// Jugador 
const geometry = new THREE.PlaneGeometry(6, 6);

const material = new THREE.MeshBasicMaterial({
    map: texturemario,
    transparent: true
});

const cube = new THREE.Mesh(geometry, material);
cube.position.set(-22, 2, 0);

scene.add(cube);


// Plataforma 1
const geometry1 = new THREE.BoxGeometry(7, 1, 5);
const material1 = new THREE.MeshBasicMaterial({
    map: texturepiso,
});
texturepiso.repeat.set(1, 1);
const cube1 = new THREE.Mesh(geometry1, material1);
cube1.position.x = -23;
cube1.position.y = -3;
cube1.position.z = 0;
scene.add(cube1);

// Plataforma 2
const geometry2 = new THREE.BoxGeometry(4, 1, 5);
const material2 = new THREE.MeshBasicMaterial({ map: texturepiso, });
const cube2 = new THREE.Mesh(geometry2, material2);
cube2.position.x = -13;
cube2.position.y = -3;
cube2.position.z = 0;
scene.add(cube2);

// Plataforma 3
const geometry3 = new THREE.BoxGeometry(7, 1, 5);
const material3 = new THREE.MeshBasicMaterial({ map: texturepiso, });
const cube3 = new THREE.Mesh(geometry3, material3);
cube3.position.x = -2;
cube3.position.y = -0.1;
cube3.position.z = 0;
scene.add(cube3);

// Plataforma 4
const geometry4 = new THREE.BoxGeometry(8, 1, 5);
const material4 = new THREE.MeshBasicMaterial({ map: texturepiso, });
const cube4 = new THREE.Mesh(geometry4, material4);
cube4.position.x = 10;
cube4.position.y = -4;
cube4.position.z = 0;
scene.add(cube4);

// Plataforma 5
const geometry5 = new THREE.BoxGeometry(8, 1, 5);
const material5 = new THREE.MeshBasicMaterial({ map: texturepiso, });
const cube5 = new THREE.Mesh(geometry5, material5);
cube5.position.x = 18;
cube5.position.y = -1;
cube5.position.z = 0;
scene.add(cube5);

// Plataformas
const pisos = [cube1, cube2, cube3, cube4, cube5];


function crearPiso(ancho, alto, fondo, x, y, z = 0) {
    const forma = new THREE.BoxGeometry(ancho, alto, fondo);
    const material = new THREE.MeshBasicMaterial({ map: texturepiso, });
    const piso = new THREE.Mesh(forma, material);
    piso.position.set(x, y, z);
    scene.add(piso);
    pisos.push(piso);

    return piso; //
}


crearPiso(8, 1, 5, -35, -3);
crearPiso(8, 1, 5, 60, -2);
//crearPiso(8, 1, 5, 50, -3);


const piso1si = crearPiso(8, 1, 5, -49, -2);
const piso2si = crearPiso(8, 1, 5, 30, -1);
const piso3si = crearPiso(8, 1, 5, 47, -3);

//lista de plataformas para el raycaster
//const pisos = [cube1, cube2, cube3, cube4, cube5];

// plataformas móviles
const plataformasMoviles = [
    { mesh: cube3, velocidad: 0.05, limite: 5, direccion: 1, eje: "x", inicio: cube3.position.x },
    { mesh: cube5, velocidad: 0.03, limite: 3, direccion: 1, eje: "y", inicio: cube5.position.y }
];
plataformasMoviles.push(
    { mesh: piso1si, velocidad: 0.04, limite: 4, direccion: 1, eje: "x", inicio: piso1si.position.x },
    { mesh: piso2si, velocidad: 0.02, limite: 3, direccion: 1, eje: "y", inicio: piso2si.position.y },
    { mesh: piso3si, velocidad: 0.05, limite: 4, direccion: 1, eje: "x", inicio: piso3si.position.x }
);
//fisicas
const velocidad = new THREE.Vector3(0, 0, 0);
const gravedad = -0.02;
const rapidez = 0.18;
const salto = 0.35;

let enPiso = false;


//Raycaster
const raycaster = new THREE.Raycaster();
const abajo = new THREE.Vector3(0, -1, 0);

const teclas = {
    izquierda: false,
    derecha: false
};


document.addEventListener("keydown", function (event) {

    if (event.code === "KeyR") {
        reiniciarJuego();
    }

    if (event.code === "KeyA") {
        teclas.izquierda = true;
    }

    if (event.code === "KeyD") {
        teclas.derecha = true;
    }

    if ((event.code === "Space" || event.code === "KeyW") && enPiso) {
        velocidad.y = salto;
        enPiso = false;
    }

});

document.addEventListener("keyup", function (event) {
    if (event.code === "KeyA") {
        teclas.izquierda = false;
    }

    if (event.code === "KeyD") {
        teclas.derecha = false;
    }
});

function reiniciarJuego() {
    // posición inicial del jugador
    cube.position.set(-22, 2, 0);

    // resetear velocidad
    velocidad.set(0, 0, 0);

    // estado
    enPiso = false;
}



function animate() {

    requestAnimationFrame(animate);

    velocidad.x = 0;

    if (teclas.izquierda) {
        velocidad.x = -rapidez;
    }

    if (teclas.derecha) {
        velocidad.x = rapidez;
    }

    //gravedad
    velocidad.y += gravedad;

    //movimiento vertical
    cube.position.y += velocidad.y;

    //Raycast hacia abajo 
    const origen = new THREE.Vector3(
        cube.position.x,
        cube.position.y,
        cube.position.z
    );

    //raycaster.set(origen, direccion);

    raycaster.set(origen, abajo);
    const intersects = raycaster.intersectObjects(pisos);

    enPiso = false;
    const distanciaPiso = 3;

    if (intersects.length > 0) {
        const golpe = intersects[0];

        if (golpe.distance <= distanciaPiso && velocidad.y <= 0) {
            const piso = golpe.object;
            const parteSuperior = piso.position.y + 0.5;

            cube.position.y = parteSuperior + 3;

            velocidad.y = 0;
            enPiso = true;

            // 
            plataformasMoviles.forEach(p => {
                if (p.mesh === piso) {
                    if (p.eje === "x") {
                        cube.position.x += p.velocidad * p.direccion;
                    }
                    if (p.eje === "y") {
                        cube.position.y += p.velocidad * p.direccion;
                    }
                }
            });
        }
    }

    cube.position.x += velocidad.x;

    // Camara sigue al jugador
    camera.position.x = cube.position.x;
    camera.position.y = cube.position.y + 4;
    camera.position.z = 30;
    camera.lookAt(cube.position.x, cube.position.y, cube.position.z);


    // Ajuste de pantalla 

    window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight);
    });



    // movimiento de plataformas
    plataformasMoviles.forEach(p => {
        if (p.eje === "x") {
            p.mesh.position.x += p.velocidad * p.direccion;

            if (Math.abs(p.mesh.position.x - p.inicio) > p.limite) {
                p.direccion *= -1;
            }
        }

        if (p.eje === "y") {
            p.mesh.position.y += p.velocidad * p.direccion;

            if (Math.abs(p.mesh.position.y - p.inicio) > p.limite) {
                p.direccion *= -1;
            }
        }
    });

    renderer.render(scene, camera);

    bg1.position.x = camera.position.x * 0.2;
    bg2.position.x = camera.position.x * 0.5;

}
animate();