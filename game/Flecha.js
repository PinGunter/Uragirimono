import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';

class Flecha extends THREE.Object3D{
    constructor(posicion, direccion){
        super();

        // primero modelamos la flecha
        var cuerpoGeo = new THREE.CylinderGeometry(0.5,0.5,7,8);
        cuerpoGeo.rotateZ(Math.PI/2);
        var matCuerpo = new THREE.MeshStandardMaterial({color: 0x362b1f});
        this.cuerpo = new THREE.Mesh(cuerpoGeo, matCuerpo);

        // ahora la punta
        var puntaGeo1 = new THREE.ConeGeometry(2,3,2);
        puntaGeo1.rotateZ(-Math.PI/2);
        puntaGeo1.translate(5,0,0);
        var puntaGeo2 = new THREE.ConeGeometry(2,3,2);
        puntaGeo2.rotateZ(-Math.PI/2);
        puntaGeo2.rotateX(-Math.PI/2);
        puntaGeo2.translate(5,0,0);
        var matPunta = new THREE.MeshStandardMaterial({color: "grey", metalness: 0.8, roughness: 0.5});
        this.flecha1 = new THREE.Mesh(puntaGeo1, matPunta);
        this.flecha2 = new THREE.Mesh(puntaGeo2, matPunta);


        this.add(this.cuerpo);
        this.add(this.flecha1);
        this.add(this.flecha2)
    }
}

export {Flecha};

