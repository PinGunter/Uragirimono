import { Mejora } from "./Mejora.js";
import { Katana } from './Katana.js';
import * as THREE from '../libs/three.module.js';
import * as TWEEN from "../libs/tween.esm.js";

class MejoraVida extends Mejora {
    constructor(parentNode) {
        super(parentNode);

        this.mainCorazon = this.crearCorazon();
        this.mainCorazon.scale.set(3,3,3);
        this.add(this.mainCorazon)

        this.corazones = [];
        // flecha
        for (var i = 0; i < 5; i++) {
            this.corazones.push(this.crearCorazon());
            this.add(this.corazones[i])
        }

        this.corazones[0].position.set(0, 0, 0);
        this.corazones[1].position.set(0, 4, 8);
        this.corazones[2].position.set(0, 6, -8);
        this.corazones[3].position.set(0, 16, 3.5);
        this.corazones[4].position.set(0, 16, -4.5);

        var cajaGeo = new THREE.BoxGeometry(2, 20, 20);
        cajaGeo.translate(0, 12, 0);
        var cajaMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 })
        this.caja = new THREE.Mesh(cajaGeo, cajaMat);
        this.add(this.caja);
        this.animar();

    }

    crearCorazon() {
        var corazonShape = new THREE.Shape();

        corazonShape.moveTo(2, 0);
        corazonShape.bezierCurveTo(4, 1, 4, 2, 4, 2);
        corazonShape.bezierCurveTo(4, 4, 2, 3, 2, 2);
        corazonShape.bezierCurveTo(2, 3, 0, 4, 0, 2);
        corazonShape.bezierCurveTo(0, 2, 0, 1, 2, 0);

        var geometry = new THREE.ExtrudeGeometry(corazonShape, { depth: 0.1 });
        geometry.translate(-2, 1.5, 0);
        geometry.rotateY(Math.PI / 2);
        var material = new THREE.MeshPhongMaterial({ color: "red" });
        var corazon = new THREE.Mesh(geometry, material);
        this.geometrias.push(geometry);
        this.materiales.push(material)
        return corazon;
    }

    hpBoost() {
        if (this.mejoraAplicada) return 0;
        this.mejoraAplicada = true;
        return Math.floor(Math.random() * (3) + 1);
    }

    mejoroAtaque() {
        return false;
    }

    mejoroVida() {
        return true;
    }

    update() {
        this.rotation.y += 0.01;
        this.corazones.forEach(flecha => {
            flecha.position.y = (flecha.position.y + 0.1) % 20;
        })
    }
}

export { MejoraVida};