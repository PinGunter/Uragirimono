import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';

class Enemigo extends THREE.Object3D {
    constructor(escena) {
        super();
        this.escena = escena;
        this.vidasTotales = 4;
        this.vidasActuales = this.vidasTotales;
        this.materiales = [];
        this.geometrias = [];
    }

    morir() {
        var origenR = { a: 0 };
        var destinoR = { a: Math.PI / 2 };

        var rotacion = new TWEEN.Tween(origenR)
            .to(destinoR, 500)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                this.rotation.x = -origenR.a;
            });

        var origenD = { e: 0.5 };
        var destinoD = { e: 0 };

        var desaparece = new TWEEN.Tween(origenD)
            .to(destinoD, 80)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                this.scale.set(origenD.e, origenD.e, origenD.e);
            })
            .onComplete(() => {
                this.eliminarGeometria();
                this.vidasTotales = 0;
                this.escena.remove(this);
            })

        rotacion.chain(desaparece);
        rotacion.start();
    }

    eliminarGeometria() {
        this.geometrias.forEach(geo => {
            geo.dispose();
        });
        this.materiales.forEach(mat => {
            mat.dispose();
        });
    }
}

export { Enemigo };