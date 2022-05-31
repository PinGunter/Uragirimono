
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import { OrbitControls } from '../libs/OrbitControls.js'
import { Stats } from '../libs/stats.module.js'
import * as TWEEN from '../libs/tween.esm.js'

// Clases de mi proyecto
import { Ronin } from './Ronin.js'
import { Motobug } from './Motobug.js'
import { MejoraDanio } from './MejoraDanio.js'
import { MejoraVida } from './MejoraVida.js'
/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */


class MyScene extends THREE.Scene {
    constructor(myCanvas, debug = false) {
        super();
        this.debug = debug;
        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Se añade a la gui los controles para manipular los elementos de esta clase

        this.initStats();

        this.background = new THREE.Color(0xFFFFFF);

        // Construimos los distinos elementos que tendremos en la escena

        // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
        // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
        this.createLights();

        // Tendremos una cámara con un control de movimiento con el ratón
        this.createCamera();

        // Un suelo 
        this.createGround();


        // Por último creamos el modelo.
        this.clock = new THREE.Clock();
        this.teclasPulsadas = {};
        this.ronin = new Ronin(this.camera, this);
        this.enemigos = [];
        this.enemigosMuertos = [];
        this.tocaPremio = true;
        this.premios = [];
        this.finPremio = false;
        if (!this.debug) {
            this.add(this.ronin);
            var vidas = "";
            for (var i = 0; i < this.ronin.vidas; i++) {
                vidas += "❤️";
            }
            document.getElementById("vidas").innerHTML = vidas;
            this.ronda = 1;
            this.ronin.rondaActual = this.ronda;
            this.rellenarEnemigos();
            document.getElementById("enemigos").innerText = `Quedan ${this.enemigos.length} enemigos`;
            document.getElementById("ronda").innerText = `Ronda: ${this.ronda}`;
        }

    }

    initStats() {

        var stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append(stats.domElement);

        this.stats = stats;
    }

    createCamera() {
        // Para crear una cámara le indicamos
        //   El ángulo del campo de visión en grados sexagesimales
        //   La razón de aspecto ancho/alto
        //   Los planos de recorte cercano y lejano
        var aspect = window.innerWidth / window.innerHeight;
        var d = 20;
        //create a perspective camera
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        // También se indica dónde se coloca
        this.camera.position.set(40, 80, 40);
        // Y hacia dónde mira
        var look = new THREE.Vector3(0, 0, 0);
        if (this.debug) {
            this.camera.lookAt(look);
            this.camera.rotation.order = "XYZ";
            this.camera.fov *= 10;
            this.camera.updateProjectionMatrix();
            this.add(this.camera);

            // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
            this.cameraControl = new OrbitControls(this.camera, this.renderer.domElement);
            // Se configuran las velocidades de los movimientos
            this.cameraControl.rotateSpeed = 5;
            this.cameraControl.zoomSpeed = -2;
            this.cameraControl.panSpeed = 0.5;
            // Debe orbitar con respecto al punto de mira de la cámara
            this.cameraControl.target = look;
        }
    }

    createGround() {
        var gridHelper = new THREE.GridHelper(1000, 200);
        this.add(gridHelper);
    }


    createLights() {
        // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
        // La luz ambiental solo tiene un color y una intensidad
        // Se declara como   var   y va a ser una variable local a este método
        //    se hace así puesto que no va a ser accedida desde otros métodos
        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        // La añadimos a la escena
        this.add(ambientLight);

        // Se crea una luz focal que va a ser la luz principal de la escena
        // La luz focal, además tiene una posición, y un punto de mira
        // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
        // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
        this.spotLight = new THREE.SpotLight(0xffffff);
        this.spotLight.position.set(60, 60, 40);
        this.add(this.spotLight);
    }

    createRenderer(myCanvas) {
        // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

        // Se instancia un Renderer   WebGL
        var renderer = new THREE.WebGLRenderer();


        // Se establece un color de fondo en las imágenes que genera el render
        renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

        // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
        renderer.setSize(window.innerWidth, window.innerHeight);

        // La visualización se muestra en el lienzo recibido
        $(myCanvas).append(renderer.domElement);

        return renderer;
    }

    getCamera() {
        // En principio se devuelve la única cámara que tenemos
        // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
        return this.camera;
    }

    setCameraAspect(ratio) {
        // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
        // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
        this.camera.aspect = ratio;
        // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
        this.camera.updateProjectionMatrix();
    }

    onWindowResize() {
        // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
        // Hay que actualizar el ratio de aspecto de la cámara
        this.setCameraAspect(window.innerWidth / window.innerHeight);

        // Y también el tamaño del renderizador
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    eliminarMuertos() {
        this.enemigos = []
        this.enemigosMuertos = []
    }

    rellenarEnemigos() {
        for (var i = 0; i < this.ronda * 3; i++) {
            var motobug = new Motobug(this, this.ronda);
            var x = this.ronin.position.x;
            var z = this.ronin.position.z;
            while (x > this.ronin.position.x - 5 && x < this.ronin.position.x + 5 &&
                z > this.ronin.position.z - 5 && z < this.ronin.position.z + 5) {
                z = (Math.random() * 100) - 100;
                x = (Math.random() * 100) - 100;
            }
            motobug.translateX(x);
            motobug.translateZ(z);
            this.enemigos.push(motobug);
        }
        this.enemigos.forEach(enemigo => {
            this.add(enemigo);
        })
    }

    premioRonda(){
        this.tocaPremio = false;
        var mejoraD = new MejoraDanio(this);
        mejoraD.scale.set(0.7,0.7,0.7);
        var mejoraV = new MejoraVida(this);
        mejoraV.scale.set(0.7,0.7,0.7);
        mejoraD.position.set(-30,0, -30)
        mejoraV.position.set(-30,0, 30)
        this.premios.push(mejoraD);
        this.premios.push(mejoraV);
        this.add(mejoraD);
        this.add(mejoraV)
    }

    siguienteRonda() {
        this.ronda += 1;
        this.ronin.rondaActual = this.ronda;
        this.eliminarMuertos();
        document.getElementById("ronda").innerText = `Ronda: ${this.ronda}`;
        this.rellenarEnemigos();
    }


    update() {

        if (this.stats) this.stats.update();

        // Se actualizan los elementos de la escena para cada frame

        // Se actualiza la posición de la cámara según su controlador
        // this.cameraControl.update();


        // Se actualiza el resto del modelo
        TWEEN.update();
        this.ronin.update(this.teclasPulsadas, this.camera);
        if (!this.debug) {
            this.enemigos.forEach(enemigo => {
                if (!enemigo.estoyMuerto()) {
                    if (this.ronin.interseccionOtro(enemigo)) {
                        this.ronin.quitarVida();
                        var vidas = "";
                        for (var i = 0; i < this.ronin.vidas; i++) {
                            vidas += "❤️";
                        }
                        document.getElementById("vidas").innerHTML = vidas;
                    }

                    if (this.ronin.katana.interseccionEnemigo(enemigo)) {
                        enemigo.quitarVida(this.ronin.danio);
                    }
                }
            });
            for (var i=0; i < this.enemigos.length; i++){
                this.enemigos[i].update();
                if (this.enemigos[i].estoyMuerto() && !this.enemigosMuertos.includes(i)){
                    this.enemigosMuertos.push(i);
                }
            }
            if (this.enemigosMuertos.length === this.enemigos.length && this.enemigos.length > 0 && this.enemigosMuertos.length > 0){
                if (this.tocaPremio){    
                    console.log(`Toca premio: ${this.tocaPremio}`)
                    this.premioRonda();
                }
            }

            this.premios.forEach(premio => {
                premio.update();
                if (!this.finPremio && this.ronin.interseccionOtro(premio)) {
                    if (premio.mejoroAtaque()) {
                        this.ronin.danio = Math.round(premio.dmgBoost() * this.ronin.danio * 100) / 100;
                    } else if (premio.mejoroVida()) {
                        var hpBoost = premio.hpBoost();
                        this.ronin.totalVidas += hpBoost;
                        this.ronin.vidas += hpBoost;
                        var vidas = "";
                        for (var i = 0; i < this.ronin.vidas; i++) {
                            vidas += "❤️";
                        }
                        document.getElementById("vidas").innerHTML = vidas;
                    }
                    this.finPremio = true;
                }
            })
            if (this.finPremio){
                this.premios.forEach(p => {
                    p.desaparecer();
                })
                this.premios = [];
                this.finPremio = false;
                this.tocaPremio = true;
                this.siguienteRonda();
            }

        } else {
            this.cameraControl.update();
        }
        // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
        this.renderer.render(this, this.getCamera());
        if (!this.tocaPremio) {
            document.getElementById("enemigos").innerText = `Escoge tu mejora`;
        } else {
            document.getElementById("enemigos").innerText = `Quedan ${this.enemigos.length - this.enemigosMuertos.length} enemigos`;
        }
        document.getElementById("dmgBoost").innerText = `Daño de katana: ${this.ronin.danio}`;
        // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
        // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
        // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
        requestAnimationFrame(() => this.update())
    }

    rotarRonin(evento) {
        this.ronin.rotarHaciaPuntero(evento, this.camera, this.teclasPulsadas);
    }

    pulsarTecla(evento) {
        this.teclasPulsadas[evento.key] = true;
    }

    levantarTecla(evento) {
        this.teclasPulsadas[evento.key] = false;
    }

    atacarRonin(evento) {
        this.ronin.atacar(evento);
    }

    dispararRonin(evento) {
        this.ronin.disparar(evento);
        return false;
    }


}

/// La función   main
$(function () {

    // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar

    var scene = new MyScene("#WebGL-output", false);

    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener("resize", () => scene.onWindowResize());
    window.addEventListener('keydown', (event) => {
        scene.pulsarTecla(event);
    }, false);

    window.addEventListener('keyup', (event) => {
        scene.levantarTecla(event);
    }, false);

    window.addEventListener('mousemove', (event) => {
        scene.rotarRonin(event);
    })

    window.addEventListener('click', (event) => {
        scene.atacarRonin(event);
    })

    window.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        scene.dispararRonin(event);
        return false;
    });

    // Que no se nos olvide, la primera visualización.
    scene.update();
});
