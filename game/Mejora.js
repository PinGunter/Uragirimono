import * as THREE from '../libs/three.module.js';
import * as TWEEN from "../libs/tween.esm.js";

class Mejora extends THREE.Object3D {
    constructor(parentNode) {
        super();
        this.parentNode = parentNode;
        this.mejoraAplicada = false;
        this.geometrias = [];
        this.materiales = [];
    }

    animar() {
        var origen = {y: this.position.y - 3}
        var destino = {y: this.position.y + 5}
        var botecito = new TWEEN.Tween(origen)
            .to(destino, 1500)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                this.position.y = origen.y
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();
    }

    desaparecer(){
        var origen = {e: this.scale.x};
        var destino = {e: 0};
        var desaparecer = new TWEEN.Tween(origen)
            .to(destino, 200)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                this.scale.set(origen.e, origen.e, origen.e)
            })
            .onComplete(() => {
                this.geometrias.forEach(g => {
                    g.dispose();
                })
                this.materiales.forEach(m => {
                    m.dispose();
                })
                this.parentNode.remove(this);
            })
            .start();
    }

    mejoroVida() { return false; }

    mejoroAtaque() { return false; }
}

export {Mejora};