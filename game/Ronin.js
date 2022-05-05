/* Personaje principal del juego */

import * as THREE from '../libs/three.module.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';

const Arriba = 0;
const Izquierda = 1;
const Abajo = 2;
const Derecha = 3;

class Ronin extends THREE.Object3D {
    constructor(gui) {
        super();
        this.estado = "idle";
        this.clock = new THREE.Clock();
        this.clockMovimiento = new THREE.Clock();
        this.loader = new GLTFLoader();
        this.gui = gui;
        this.altura = 10;
        this.newX = 0;
        this.newZ = 0;

        this.materialRojo = new THREE.MeshToonMaterial({color:"red",opacity: 0.5, transparent: true });
        this.materialAmarillo = new THREE.MeshToonMaterial({color:"yellow",opacity: 0.5, transparent: true });
        this.area = new THREE.Mesh(
            new THREE.TorusGeometry(5, 0.5, 16, 100),
            this.materialAmarillo
        );
        this.area.rotateX(Math.PI / 2);
        this.ronin = new THREE.Object3D();
        this.ronin.add(this.area);

        this.puntero = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.2, 16, 100),
            new THREE.MeshToonMaterial({ color: 0xff12de })
        );
        this.puntero.rotateX(Math.PI / 2);
        this.add(this.puntero);

        // datos movimientos
        this.ultimaDireccion = new THREE.Vector3();
        this.direccion = new THREE.Vector3();
        this.anguloRotacion = new THREE.Vector3(0, 1, 0);
        this.quaternonRotacion = new THREE.Quaternion();
        this.objCamara = new THREE.Vector3();
        this.velocidadMovimiento = 30;
        this.velocidadTrans = 0.2;
    }

    waitLoader(url) {
        var that = this;
        return new Promise((resolve, reject) => {
            that.loadModel();
        });
    }

    loadModel() {
        var that = this;
        this.loader.load(
            "../models/gltf/ronin.glb",
            function (gltf) {
                that.model = gltf.scene;
                that.model.scale.set(0.05, 0.05, 0.05);
                that.model.position.set(0, that.altura / 2, 0); // mide 10 de altura

                that.model.traverse((child) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });

                var animations = gltf.animations;

                that.ronin.add(that.model);
                that.add(that.ronin);

                that.createActions(that.model, animations);

                that.fadeToAction("idle", true, 1.0); // animacion inicials

            },
            function (xhr) {
                document.getElementById("info").innerHTML = "Cargando: " + (xhr.loaded / 14747348 * 100) + "%";
            },
            function (error) {

                console.log('An error happened');

            }
        );
    }

    // ******* ******* ******* ******* ******* ******* ******* 

    createActions(model, animations) {
        // Se crea un mixer para dicho modelo
        // El mixer es el controlador general de las animaciones del modelo, 
        //    las lanza, las puede mezclar, etc.
        // En realidad, cada animación tiene su accionador particular 
        //    y se gestiona a través de dicho accionador
        // El mixer es el controlador general de los accionadores particulares
        this.mixer = new THREE.AnimationMixer(model);
        console.log(this.mixer);

        // El siguiente diccionario contendrá referencias a los diferentes accionadores particulares 
        // El diccionario Lo usaremos para dirigirnos a ellos por los nombres de las animaciones que gestionan
        this.actions = {};
        // Los nombres de las animaciones se meten en este array, 
        // para completar el listado en la interfaz de usuario
        this.clipNames = [];

        for (var i = 0; i < animations.length; i++) {
            // Se toma una animación de la lista de animaciones del archivo gltf
            var clip = animations[i];

            // A partir de dicha animación obtenemos una referencia a su accionador particular
            var action = this.mixer.clipAction(clip);

            // Añadimos el accionador al diccionario con el nombre de la animación que controla
            this.actions[clip.name] = action;

            // Nos vamos a quedar como animación activa la última de la lista,
            //    es irrelevante cual dejemos como activa, pero el atributo debe referenciar a alguna
            this.activeAction = action;

            // Metemos el nombre de la animación en la lista de nombres 
            //    para formar el listado de la interfaz de usuario
            this.clipNames.push(clip.name);
        }

    }

    // createGUI(gui, str) {
    //     // La interfaz de usuario se crea a partir de la propia información que se ha
    //     // cargado desde el archivo  gltf
    //     this.guiControls = {
    //         // En este campo estará la list de animaciones del archivo
    //         current: 'Animaciones',
    //         // Este campo nos permite ver cada animación una sola vez o repetidamente
    //         repeat: false,
    //         // Velocidad de la animación
    //         speed: 1.0
    //     }

    //     // Creamos y añadimos los controles de la interfaz de usuario
    //     var folder = gui.addFolder(str);
    //     var repeatCtrl = folder.add(this.guiControls, 'repeat').name('Repetitivo: ');
    //     var clipCtrl = folder.add(this.guiControls, 'current').options(this.clipNames).name('Animaciones: ');
    //     var speedCtrl = folder.add(this.guiControls, 'speed', -2.0, 2.0, 0.1).name('Speed: ');
    //     //     var that = this;
    //     // Cada vez que uno de los controles de la interfaz de usuario cambie, 
    //     //    llamamos al método que lance la animación elegida
    //     clipCtrl.onChange(() => {
    //         this.fadeToAction(this.guiControls.current, this.guiControls.repeat, this.guiControls.speed);
    //     });
    //     repeatCtrl.onChange(() => {
    //         this.fadeToAction(this.guiControls.current, this.guiControls.repeat, this.guiControls.speed);
    //     });
    //     speedCtrl.onChange((value) => {
    //         this.activeAction.setEffectiveTimeScale(this.guiControls.speed);
    //     });
    // }


    fadeToAction(name, sentido = 1) {
        const toPlay = this.actions[name];
        const current = this.actions[this.estado];
        current.fadeOut(this.velocidadTrans);
        toPlay.setEffectiveTimeScale(sentido);
        toPlay.setLoop(THREE.Repeat);
        toPlay.reset().fadeIn(this.velocidadTrans).play();
        this.estado = name;
    }

    calcularOffsetDireccion(teclasPulsadas) {
        this.direccionOffset = 0;

        if (teclasPulsadas["w"]) {
            if (teclasPulsadas["a"]) {
                this.direccionOffset = Math.PI / 4;
            } else if (teclasPulsadas["d"]) {
                this.direccionOffset = -Math.PI / 4;
            }
        } else if (teclasPulsadas["s"]) {
            if (teclasPulsadas["a"]) {
                this.direccionOffset = Math.PI / 4 + Math.PI / 2;
            } else if (teclasPulsadas["d"]) {
                this.direccionOffset = -Math.PI / 4 - Math.PI / 2;
            } else {
                this.direccionOffset = Math.PI;
            }
        } else if (teclasPulsadas["a"]) {
            this.direccionOffset = Math.PI / 2;
        } else if (teclasPulsadas["d"]) {
            this.direccionOffset = -Math.PI / 2;
        }
        return this.direccionOffset;
    }

    rotarHaciaPuntero(evento, camara) {
        var mouse = new THREE.Vector2();
        mouse.x = (evento.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(evento.clientY / window.innerHeight) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camara);
        var puntoInterseccion = new THREE.Vector3();
        raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0)), puntoInterseccion);
        this.puntero.position.copy(new THREE.Vector3(puntoInterseccion.x, this.altura, puntoInterseccion.z));
        this.ultimaDireccion.x = this.puntero.position.x;
        this.ultimaDireccion.y = this.altura;
        this.ultimaDireccion.z = this.puntero.position.z;
        this.ronin.rotation.y = Math.atan2( ( this.puntero.position.x - this.ronin.position.x ), ( this.puntero.position.z - this.ronin.position.z ) );
    }


    moverPersonaje(teclasPulsadas, camara, delta){
        this.calcularOffsetDireccion(teclasPulsadas);
        camara.getWorldDirection(this.direccion);
        this.direccion.y = 0;
        this.direccion.normalize();
        this.direccion.applyAxisAngle(this.anguloRotacion, this.direccionOffset);
        this.newX += this.direccion.x * this.velocidadMovimiento *delta;
        this.newZ += this.direccion.z * this.velocidadMovimiento * delta;
        console.log(this.newX);
    }

    update(teclasPulsadas, camara) {
        var direccion = false;
        for (const [key, value] of Object.entries(teclasPulsadas)) {
            if (key === "w" || key === "s" || key === "a" || key === "d") {
                direccion = direccion || value;
            }
        }
        
        var accion = "";
        var sentido = 1;
        if (direccion) {
            this.area.material = this.materialRojo;
            if (teclasPulsadas["w"]) {
                accion = "correr"
            }else if (teclasPulsadas["s"]) {
                accion = "correrAtras";
            }else if (teclasPulsadas["a"]){
                accion = "strafe";
            } else if (teclasPulsadas["d"]){
                accion = "strafe";
                sentido = -1;
            }
        } else {
            this.area.material = this.materialAmarillo;
            sentido = 1;
            accion = "idle";
        }
        if (this.estado != accion) {
            this.fadeToAction(accion, sentido);
        }
        

        // Hay que pedirle al mixer que actualice las animaciones que controla
        var dt = this.clock.getDelta();
        if (this.mixer) this.mixer.update(dt);

        var delta = this.clockMovimiento.getDelta();
        if (direccion){
            this.moverPersonaje(teclasPulsadas, camara, delta);
        }
        this.ronin.position.x = this.newX;
        this.ronin.position.z = this.newZ;

    }

}

export { Ronin }