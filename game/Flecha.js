import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';

class Flecha extends THREE.Object3D {
    constructor() {
        super();

        // primero modelamos la flecha
        var cuerpoGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 8);
        cuerpoGeo.rotateZ(Math.PI / 2);
        var matCuerpo = new THREE.MeshStandardMaterial({ color: 0x362b1f });
        this.cuerpo = new THREE.Mesh(cuerpoGeo, matCuerpo);

        // ahora la cola
        var colaGeo1 = new THREE.ConeGeometry(2, 3, 2);
        colaGeo1.rotateZ(-Math.PI / 2);
        colaGeo1.translate(-5, 0, 0);
        var colaGeo2 = new THREE.ConeGeometry(2, 3, 2);
        colaGeo2.rotateZ(-Math.PI / 2);
        colaGeo2.rotateX(-Math.PI / 2);
        colaGeo2.translate(-5, 0, 0);
        var matPunta = new THREE.MeshToonMaterial({ color: "red" });
        var c1 = new THREE.Mesh(colaGeo1, matPunta);
        var c2 = new THREE.Mesh(colaGeo2, matPunta);
        this.cola = new THREE.Group();
        this.cola.add(c1);
        this.cola.add(c2);

        // ahora la punta
        var puntaShape = new THREE.Shape();
        puntaShape.moveTo(0, 0);
        puntaShape.lineTo(1, 0);
        puntaShape.lineTo(0, 3);
        puntaShape.lineTo(-1, 0);

        var puntaGeo = new THREE.ExtrudeGeometry(puntaShape, { depth: 0.2 });
        puntaGeo.rotateZ(-Math.PI / 2);
        puntaGeo.translate(3.5, 0, 0);
        var puntaMat = new THREE.MeshStandardMaterial({ color: "white", metalness: 0.8, roughness: 0.5 });
        this.punta = new THREE.Mesh(puntaGeo, puntaMat);

        // colisiones
        var colisionGeo = new THREE.BoxGeometry(13, 4, 4);
        var colisionMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 });
        this.caja = new THREE.Mesh(colisionGeo, colisionMat);

        this.add(this.punta);
        this.add(this.cuerpo);
        this.add(this.cola);
        this.add(this.caja);

        this.disparar(new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0, 100), -Math.PI / 4);

    }

    disparar(posicion, destino, angulo) {
        var origen = { x: posicion.x, z: posicion.z };
        var desti = { x: destino.x, z: destino.z };
        var moverse = new TWEEN.Tween(origen)
        .to(desti, 10000)
        .onStart(() => {
            this.rotation.y = angulo;
        })
        .onUpdate(() => {
            this.position.set(origen.x, 0, origen.z);
        }
        ).start();
    }

}

export { Flecha };

