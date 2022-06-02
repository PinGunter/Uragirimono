import * as THREE from '../libs/three.module.js';
import * as TWEEN from '../libs/tween.esm.js';

class Flecha extends THREE.Object3D {
    constructor(parentNode, enemigos, borders) {
        super();
        this.parentNode = parentNode;
        this.enemigos = enemigos;
        this.borders = borders;
        // primero modelamos la flecha
        var cuerpoGeo = new THREE.CylinderGeometry(0.5, 0.5, 7, 8);
        cuerpoGeo.rotateZ(Math.PI / 2);
        cuerpoGeo.translate(0, 10, 0);
        var matCuerpo = new THREE.MeshStandardMaterial({ color: 0x362b1f });
        this.cuerpo = new THREE.Mesh(cuerpoGeo, matCuerpo);

        // ahora la cola
        var colaGeo1 = new THREE.ConeGeometry(2, 3, 2);
        colaGeo1.rotateZ(-Math.PI / 2);
        colaGeo1.translate(-5, 10, 0);
        var colaGeo2 = new THREE.ConeGeometry(2, 3, 2);
        colaGeo2.rotateZ(-Math.PI / 2);
        colaGeo2.rotateX(-Math.PI / 2);
        colaGeo2.translate(-5, 10, 0);
        var colaMat = new THREE.MeshToonMaterial({ color: "red" });
        var c1 = new THREE.Mesh(colaGeo1, colaMat);
        var c2 = new THREE.Mesh(colaGeo2, colaMat);
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
        puntaGeo.translate(3.5, 10, 0);
        var puntaMat = new THREE.MeshStandardMaterial({ color: "white", metalness: 0.8, roughness: 0.5 });
        this.punta = new THREE.Mesh(puntaGeo, puntaMat);

        // colisiones
        var colisionGeo = new THREE.BoxGeometry(13, 4, 4);
        var colisionMat = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 });
        this.caja = new THREE.Mesh(colisionGeo, colisionMat);

        this.geometrias = [];
        this.materiales = [];
        this.geometrias.push(cuerpoGeo);
        this.geometrias.push(colaGeo1);
        this.geometrias.push(colaGeo2);
        this.geometrias.push(puntaGeo);
        this.materiales.push(matCuerpo);
        this.materiales.push(colaMat);
        this.materiales.push(puntaMat);


        this.wrap = new THREE.Object3D();
        this.wrap.add(this.punta);
        this.wrap.add(this.cuerpo);
        this.wrap.add(this.cola);
        this.wrap.add(this.caja);

        this.add(this.wrap);

        this.rotateY(-Math.PI / 2)
        this.scale.set(0.3, 0.3, 0.3);

    }

    // podrá atacar a hasta 3 enemigos por flecha, sino sería demasiad poderoso
    disparar(posicion, destino, angulo) {
        var hitsEnemigos = 0;

        var origenE = { e: 0 };
        var destinoE = { e: this.scale.x };
        var aparecer = new TWEEN.Tween(origenE)
            .to(destinoE, 275)
            .easing(TWEEN.Easing.Linear.None)
            .onStart(() => {
                this.wrap.rotation.y = angulo;
                this.position.copy(posicion.x, 10, posicion.z);
            })
            .onUpdate(() => {
                this.scale.set(origenE.e, origenE.e, origenE.e)
            })

        origenE = { e: this.scale.x };
        var desaparecer = new TWEEN.Tween(origenE)
            .to({ e: 0 }, 100)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                this.scale.set(origenE.e, origenE.e, origenE.e)
            })
            .onComplete(() => {
                this.geometrias.forEach(g => {
                    g.dispose();
                })
                this.materiales.forEach(m => {
                    m.dispose();
                })
                this.parentNode.remove(this);
            }
            )

        var origen = { x: posicion.x, z: posicion.z };
        var desti = { x: destino.x, z: destino.z };
        console.log(`disparando desde [${origen.x},${origen.z}] hacia [${desti.x},${desti.z}]`);
        var v_o = new THREE.Vector2(origen.x, origen.z);
        var v_d = new THREE.Vector2(desti.x, desti.z);
        var espacio =  v_o.distanceTo(v_d) * 1000;
        var tiempo = espacio / 150;
        console.log(`Espacio: ${espacio} | Tiempo: ${tiempo}`);
        var moverse = new TWEEN.Tween(origen)
            .to(desti, tiempo)
            .onStart(() => {
                console.log("disparando");
                // console.log(this.rotation.y);
            })
            .onUpdate(() => {
                this.position.set(origen.x, 5, origen.z);
                this.enemigos.forEach(otro => {
                    if (hitsEnemigos < 3) {
                        var vectorEntreObj = new THREE.Vector2();
                        var v_caja = new THREE.Vector3();
                        var v_otro = new THREE.Vector3();
                        otro.caja.getWorldPosition(v_otro);
                        this.caja.getWorldPosition(v_caja);
                        vectorEntreObj.subVectors(new THREE.Vector2(v_caja.x, v_caja.z),
                            new THREE.Vector2(v_otro.x, v_otro.z));
                        if (vectorEntreObj.length() < 4) {
                            if (otro.quitarVida(1))
                                hitsEnemigos++;
                        }
                    }
                })
            })



        aparecer.chain(moverse);
        moverse.chain(desaparecer);
        aparecer.start();
    }

}

export { Flecha };

