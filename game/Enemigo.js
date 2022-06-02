import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';

class Enemigo extends THREE.Object3D {
    constructor(escena, vidas, bordes) {
        super();
        this.escena = escena;
        this.vidasTotales = vidas;
        this.vidasActuales = this.vidasTotales;
        this.borders = bordes;

        this.geometrias = [];
        this.materiales = [];

        // barra de vida
        this.barraVida = [];
        for (var i = -this.vidasTotales / 2 + 0.5; i < this.vidasTotales / 2 + 0.5; i++) {
            var vida = new THREE.Mesh(
                new THREE.BoxBufferGeometry(2, 2, 2),
                new THREE.MeshToonMaterial({ color: "red" })
            );
            vida.position.set(i * 4, 17, 0);
            this.barraVida.push(vida);
            this.add(vida);
        }

        // reloj para el daño
        this.clock = new THREE.Clock();
        this.clock.getDelta();
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
                this.vidasActuales = 0;
                console.log("me borro");
                this.geometrias.forEach(geo => {
                    console.log("eliminando geometria")
                    geo.dispose();
                });
                this.materiales.forEach(mat => {
                    console.log("eliminando material")
                    mat.dispose();
                });
                this.escena.remove(this);
            })

        rotacion.chain(desaparece);
        rotacion.start();
    }


    quitarVida(d) {
        var dt = this.clock.getDelta();
        if (dt > 0.4) {
            for (var i = 0; i < d; i++) {
                this.vidasActuales -= 1;
                if (this.vidasActuales < 0) {
                    this.vidasActuales = 0;
                }
                this.barraVida[this.vidasTotales - this.vidasActuales - 1].material.transparent = true;
                this.barraVida[this.vidasTotales - this.vidasActuales - 1].material.opacity = 0;
                if (this.vidasActuales === 0) {
                    this.morir();
                    break;
                }
            }
            return true;
        }
        return false;

    }

    estoyMuerto() {
        return this.vidasActuales === 0;
    }

}

export { Enemigo };