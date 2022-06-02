import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'
import {Enemigo} from './Enemigo.js'

class Canion extends Enemigo{
    constructor(escena,vidas, enemigo){
        super(escena,vidas,null);

        this.geometrias = [];
        this.materiales = [];
        this.enemigo = enemigo;

        var canionGeo = new THREE.TorusGeometry(4,1,7,7);
        canionGeo.rotateX(Math.PI/2);
        canionGeo.scale(1,5,1);
        canionGeo.translate(0,6.5,0);
        var canionMat = new THREE.MeshToonMaterial({color:0x7d34eb});
        this.canion = new THREE.Mesh(canionGeo,canionMat);

        var baseGeo = new THREE.CylinderGeometry(4,7,2,9);
        baseGeo.translate(0,1,0);
        var baseMat = new THREE.MeshToonMaterial({color:"green"});
        this.base = new THREE.Mesh(baseGeo,baseMat);


        this.add(this.canion);
        this.add(this.base);
        this.disparar();
    }


    crearBala(){
        var bala = new THREE.Mesh(
            new THREE.SphereGeometry(3.7,8,8),
            new THREE.MeshStandardMaterial({color:"black", metalness:0.8, roughness:0.5})
        )
        this.add(bala);
        return bala;
    }

    disparar(){
        var bala = this.crearBala();
        var espera = new TWEEN.Tween({t:0}).to({t:1}, 1500)

        // ahora calculamos la trayectoria
        var objetivo = new THREE.Vector3(50,0,30);
        var puntoMedio = new THREE.Vector3((bala.position.x + objetivo.x)/2, 50 ,(bala.position.z + objetivo.z)/2);
        var puntoFinal = new THREE.Vector3(objetivo.x, 0, objetivo.z);
        var trayectoria = new THREE.CatmullRomCurve3([
            this.position,
            new THREE.Vector3(bala.position.x, bala.position.y + 5, bala.position.z),
            puntoMedio,
            puntoFinal
        ]);

        var origenTrayectoria = {t:0};
        var destinoTrayectoria = {t:1};
        var espacio = this.position.distanceTo(objetivo) *1000;
        var tiempo = espacio / 50;
        var trayectoriaTween = new TWEEN.Tween(origenTrayectoria)
        .to(destinoTrayectoria, tiempo)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onStart(() => {
            bala = this.crearBala();
            console.log(`Disparando bala desde ${this.position.x},${this.position.y},${this.position.z} hacia ${objetivo.x},${objetivo.y},${objetivo.z}`);
        })
        .onUpdate(() => {
            var t = origenTrayectoria.t;
            var posicion = trayectoria.getPoint(t);
            bala.position.copy(posicion);
        }).onComplete(() => {
            this.remove(bala);
            bala.geometry.dispose();
            bala.material.dispose();
        })
        espera.chain(trayectoriaTween);
        trayectoriaTween.chain(espera);
        espera.start();
    }

}


export {Canion};