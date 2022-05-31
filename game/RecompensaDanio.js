import { Recompensa } from "./Recompensa.js";
import { Katana } from './Katana.js';
import * as THREE from '../libs/three.module.js';
import * as TWEEN from "../libs/tween.esm.js";

class RecompensaDanio extends Recompensa {
    constructor() {
        super();

        // la recompensa será un katana con varias flechas verdes indicando que "sube"
        this.katana = new Katana();
        this.katana.rotateX(Math.PI / 6)
        this.katana.scale.set(0.7, 0.7, 0.7);
        this.add(this.katana);

        this.flechas = [];
        // flecha
        for (var i = 0; i < 5; i++) {
            this.flechas.push(this.crearFlecha());
            this.add(this.flechas[i])
        }

        this.flechas[0].position.set(0, 0, 0);
        this.flechas[1].position.set(0, 4, 8);
        this.flechas[2].position.set(0, 6, -8);
        this.flechas[3].position.set(0, 16, 3.5);
        this.flechas[4].position.set(0, 16, -4.5);

        var cajaGeo = new THREE.BoxGeometry(2,20,20);
        cajaGeo.translate(0,12,0);
        var cajaMat = new THREE.MeshStandardMaterial({transparent: true, opacity: 0})
        this.caja = new THREE.Mesh(cajaGeo, cajaMat);
        this.add(this.caja);

    }


    crearFlecha() {
        var cuerpoGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 6)
        var cabezaGeo = new THREE.ConeGeometry(1, 3, 6);
        cabezaGeo.translate(0, 3.5, 0);
        var flechaMat = new THREE.MeshToonMaterial({ color: "green" });
        var flecha = new THREE.Group();
        flecha.add(new THREE.Mesh(cuerpoGeo, flechaMat));
        flecha.add(new THREE.Mesh(cabezaGeo, flechaMat));
        return flecha;
    }


    update() {
        this.rotation.y += 0.01;
        this.flechas.forEach(flecha => {
            flecha.position.y = (flecha.position.y + 0.1) % 20;
        })
    }
}

export { RecompensaDanio };