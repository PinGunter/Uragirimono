/* Personaje principal del juego */

import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js'
import { GLTFLoader } from '../libs/GLTFLoader.js';
import { Katana } from './Katana.js';
import { Flecha } from './Flecha.js';

var morirAction;
const TotalVidas = 5;
var escaladoOriginal;

class Ronin extends THREE.Object3D {
    constructor(camera, escena) {
        super();
        this.escena = escena;
        this.estado = "idle";
        this.clock = new THREE.Clock();
        this.clockMovimiento = new THREE.Clock();
        this.loader = new GLTFLoader();
        this.altura = 10;
        this.newX = 0;
        this.newZ = 0;
        this.camera = camera;
        this.vidas = TotalVidas;
        this.rondaActual = 1;
        this.danio = 2;

        this.ataqueEspecialCooldown = 5;
        this.tiempoCooldown = 0;

        this.ronin = new THREE.Object3D(); // el personaje en sí

        this.roninWrap = new THREE.Object3D();
        this.roninWrap.add(this.ronin);
        this.add(this.roninWrap);


        // caja que envuelve al personaje para facilitar deteccion de colisiones
        this.caja = new THREE.Mesh(
            new THREE.BoxGeometry(6, 6, 6),
            new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
        )
        this.caja.name = "cajaRonin";
        this.roninWrap.add(this.caja);
        this.camera.position.set(50, 90, 0);
        this.roninWrap.add(this.camera);
        var target = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(target);

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
        this.velocidadMovimiento = 30;
        this.velocidadTrans = 0.2;

        this.ready = false;
        var diferidos = [];
        diferidos.push(this, this.loadModel());
        $.when.apply(this, diferidos).done(() => {
            console.log("modelo cargado");
        });
        this.barraVida = [];
        for (var i = -this.vidas / 2 + 0.5; i < this.vidas / 2 + 0.5; i++) {
            var vida = new THREE.Mesh(
                new THREE.BoxBufferGeometry(2, 2, 2),
                new THREE.MeshBasicMaterial({ color: "red" })
            );
            vida.position.set(0, 12.5, i * 4);
            this.barraVida.push(vida);
            // this.roninWrap.add(vida);
        }

        //katana
        this.katana = new Katana();
        escaladoOriginal = this.katana.scale.x;
        this.katanaWrap = new THREE.Object3D();
        this.katanaWrap.add(this.katana);
        // this.katana.position.set(-4, 5, 4); // posicion de ataque
        this.restaurarKatana();
        this.ronin.add(this.katanaWrap);
    }

    loadModel() {
        var metodoDiferido = $.Deferred();
        var that = this;
        this.loader.load(
            "../models/gltf/ronin.glb",
            function (gltf) {
                that.model = gltf.scene;
                that.model.scale.set(0.05, 0.05, 0.05);
                that.model.position.set(0, that.altura / 2, 0); // mide 10 de altura

                that.model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                var animations = gltf.animations;

                that.ronin.add(that.model);
                that.roninWrap.add(that.ronin);

                that.createActions(that.model, animations);

                that.fadeToAction("idle", true, 1.0); // animacion inicials

                document.getElementById("info").innerHTML = "";
                that.ready = true;
            },
            function (xhr) {
                document.getElementById("info").innerHTML = "Cargando: " + (xhr.loaded / 14490616 * 100) + "%";
            },
            function (error) {

                console.log('An error happened');

            }
        );
        return metodoDiferido.promise();
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
        var that = this;
        this.mixer.addEventListener('finished', function (e) {
            if (e.action === morirAction) {
                document.body.style.cursor = "auto";
                console.log("Muero")
                document.getElementById("fin").style.display = "block";
                document.getElementById("rondas-aguantadas").innerText = `Has aguantado ${that.rondaActual} rondas`;
            }
        })

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

        morirAction = this.actions["morir"];

    }

    fadeToAction(name, sentido = 1) {
        const toPlay = this.actions[name];
        const current = this.actions[this.estado];
        current.fadeOut(this.velocidadTrans);
        if (name === "disparar")
            toPlay.setEffectiveTimeScale(2);
        else
            toPlay.setEffectiveTimeScale(sentido);
        if (name === "ataque" || name === "disparar" || name === "recibeGolpe" || name === "morir")
            toPlay.setLoop(THREE.LoopOnce);
        else
            toPlay.setLoop(THREE.Repeat);

        if (name === "morir") {
            toPlay.clampWhenFinished = true;
        }
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
        if (this.vidas > 0 || this.actions["morir"].isRunning()) {
            var mouse = new THREE.Vector2();
            mouse.x = (evento.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(evento.clientY / window.innerHeight) * 2 + 1;
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camara);
            var puntoInterseccion = new THREE.Vector3();
            raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0)), puntoInterseccion);
            this.puntero.position.copy(new THREE.Vector3(puntoInterseccion.x, 0, puntoInterseccion.z));
            var coordenadasRoninGlobales = new THREE.Vector3();
            this.ronin.getWorldPosition(coordenadasRoninGlobales);

            this.ronin.rotation.y = Math.atan2((this.puntero.position.x - coordenadasRoninGlobales.x), (this.puntero.position.z - coordenadasRoninGlobales.z));
        }
    }

    restaurarKatana() {
        this.katana.position.set(1, 7, -1);
        this.katana.rotation.x = Math.PI;
        this.katana.rotation.z = - Math.PI / 6;
        this.katana.scale.set(escaladoOriginal, escaladoOriginal, escaladoOriginal);
        this.katana.canHit = false;
        this.katana.puedoAnimar = true;
        this.katana.atacando = false;
        this.katana.detenerAnimacion = false;
        this.katanaWrap.rotation.y = this.katanaWrap.rotation.x = this.katanaWrap.rotation.z = 0;
    }

    atacar(evento) {
        if (!this.actions['morir'].isRunning() && this.vidas > 0) {
            this.katana.detenerAnimacion = true;
            this.fadeToAction("ataque", 1);
            // primero tenemos que desenvainarla
            // como en el nier, desaparece de la espalda para aparecer inmediatamente
            // en la posicion de ataque
            // cuando el ataque termina vuelve a aparecer en el espalda

            var origenDesen = { e: escaladoOriginal };
            var destinoDesen = { e: 0 };
            var desevainar = new TWEEN.Tween(origenDesen)
                .to(destinoDesen, 300)
                .onStart(() => {
                    this.katana.puedoAnimar = false;
                })
                .easing(TWEEN.Easing.Linear.None)
                .onUpdate(() => {
                    this.katana.scale.set(origenDesen.e, origenDesen.e, origenDesen.e);
                })
                .onComplete(() => {
                    this.katana.rotation.x = -Math.PI / 2;
                })

            // ahora aparece en el sitio preparado
            var origenAparecer = { e: 0, x: this.katana.position.x, z: this.katana.position.z };
            var destinoAparecer = { e: escaladoOriginal, x: 4, z: 4 };
            var aparecer = new TWEEN.Tween(origenAparecer)
                .to(destinoAparecer, 300)
                .onStart(() => {
                    this.katana.position.x = destinoAparecer.x;
                    this.katana.position.z = destinoAparecer.z;
                })
                .onUpdate(() => {
                    this.katana.scale.set(origenAparecer.e, origenAparecer.e, origenAparecer.e);
                })


            // ahora la rotacion para el ataque
            var origenAt = { a: 0 };
            var destinoAt = { a: -Math.PI / 2 }
            var ataque = new TWEEN.Tween(origenAt)
                .to(destinoAt, 150)
                .onStart(() => {
                    this.katana.canHit = true;
                })
                .easing(TWEEN.Easing.Linear.None)
                .onUpdate(() => {
                    this.katanaWrap.rotation.y = origenAt.a;
                });

            // vuelta a la normalidad 
            // primero desaparece y luego vuelve a aparecer
            var origenVuelta = { e: escaladoOriginal }
            var destinoVuelta = { e: 0 }
            var vuelta = new TWEEN.Tween(origenVuelta)
                .to(destinoVuelta, 300)
                .onStart(() => {
                    this.katana.canHit = false;
                })
                .onUpdate(() => {
                    this.katana.scale.set(origenVuelta.e, origenVuelta.e, origenVuelta.e);
                })
                .onComplete(() => {
                    this.restaurarKatana();
                })

            // vuelve a aparece en la espalda

            var origenEspalda = { e: 0 }
            var destinoEspalda = { e: escaladoOriginal }
            var vueltaEspalda = new TWEEN.Tween(origenEspalda)
                .to(destinoEspalda, 300)
                .onUpdate(() => {
                    this.katana.scale.set(origenEspalda.e, origenEspalda.e, origenEspalda.e);
                })
            desevainar.chain(aparecer);
            aparecer.chain(ataque);
            ataque.chain(vuelta);
            vuelta.chain(vueltaEspalda);
            desevainar.start();
        }
    }

    disparar() {
        if (!this.actions['morir'].isRunning() && this.vidas > 0) {
            this.fadeToAction("disparar", 1)
            var posicionGlobalRonin = new THREE.Vector3();
            this.ronin.getWorldPosition(posicionGlobalRonin);
            var direccion = new THREE.Vector3(
                this.puntero.position.x - posicionGlobalRonin.x,
                10,
                this.puntero.position.z - posicionGlobalRonin.z
            )
            // direccion = direccion.normalize();
            var angulo = Math.atan2((this.puntero.position.x - posicionGlobalRonin.x), (this.puntero.position.z - posicionGlobalRonin.z));
            var flecha = new Flecha(this, this.escena.enemigos);
            this.add(flecha);
            flecha.disparar(posicionGlobalRonin, direccion, angulo);

        }
    }

    ataqueEspecial(evento) {
        if (this.tiempoCooldown == 0) {
            this.fadeToAction("ataqueEspecial", 1);
            document.getElementById("disponible").innerHTML = "Ataque Especial disponible en ";
            document.getElementById("cooldown").innerHTML = this.ataqueEspecialCooldown;
            this.tiempoCooldown = this.ataqueEspecialCooldown;
        } else console.log("no puedo atacar");
    }

    reducirCooldown() {
        this.tiempoCooldown -= 1;
    }

    moverPersonaje(teclasPulsadas, camara, delta) {
        this.calcularOffsetDireccion(teclasPulsadas);
        camara.getWorldDirection(this.direccion);
        this.direccion.y = 0;
        this.direccion.normalize();
        this.direccion.applyAxisAngle(this.anguloRotacion, this.direccionOffset);
        this.newX += this.direccion.x * this.velocidadMovimiento * delta;
        this.newZ += this.direccion.z * this.velocidadMovimiento * delta;
    }

    interseccionEnemigo(otro) {
        if (this.ready) {
            var vectorEntreObj = new THREE.Vector2();
            var v_caja = new THREE.Vector3();
            var v_otro = new THREE.Vector3();
            otro.caja.getWorldPosition(v_otro);
            this.caja.getWorldPosition(v_caja);
            vectorEntreObj.subVectors(new THREE.Vector2(v_caja.x, v_caja.z),
                new THREE.Vector2(v_otro.x, v_otro.z));
            return (vectorEntreObj.length() < this.caja.geometry.parameters.width); // se puede revisar
        }
    }

    quitarVida() {
        if (this.vidas > 0 && !(this.actions["recibeGolpe"].isRunning() || this.actions["ataqueEspecial"].isRunning() || this.actions["morir"].isRunning())) {
            this.vidas -= 1;
            if (this.vidas > 0) {
                this.fadeToAction("recibeGolpe", 1);
                this.barraVida[TotalVidas - this.vidas - 1].material.transparent = true;
                this.barraVida[TotalVidas - this.vidas - 1].material.opacity = 0;
            } else {
                this.barraVida[TotalVidas - this.vidas - 1].material.transparent = true;
                this.barraVida[TotalVidas - this.vidas - 1].material.opacity = 0;
                this.fadeToAction("morir", 1);

            }
        }
    }

    update(teclasPulsadas, camara) {
        if ((this.vidas > 0 || this.actions["morir"].isRunning())) {
            var direccion = false;
            for (const [key, value] of Object.entries(teclasPulsadas)) {
                if (key === "w" || key === "s" || key === "a" || key === "d") {
                    direccion = direccion || value;
                }
            }

            var accion = "";
            var sentido = 1;
            if (direccion) {
                if (teclasPulsadas["w"]) {
                    accion = "correr"
                } else if (teclasPulsadas["s"]) {
                    accion = "correrAtras";
                } else if (teclasPulsadas["a"]) {
                    accion = "strafe";
                } else if (teclasPulsadas["d"]) {
                    accion = "strafe";
                    sentido = -1;
                }
            } else {
                sentido = 1;
                accion = "idle";
            }

            if (teclasPulsadas["b"]) {
                accion = "bailecito";
            }

            if (this.estado != accion) {
                if (!(this.actions["ataque"].isRunning() ||
                    this.actions["disparar"].isRunning() ||
                    this.actions["recibeGolpe"].isRunning() ||
                    this.actions["morir"].isRunning()))
                    this.fadeToAction(accion, sentido);
            }


            // Hay que pedirle al mixer que actualice las animaciones que controla
            var dt = this.clock.getDelta();
            if (this.mixer) this.mixer.update(dt);

            var delta = this.clockMovimiento.getDelta();
            if (direccion) {
                this.moverPersonaje(teclasPulsadas, camara, delta);
            }
            this.roninWrap.position.x = this.newX;
            this.roninWrap.position.z = this.newZ;

        }
    }

}

export { Ronin }