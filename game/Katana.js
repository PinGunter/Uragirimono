import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'

class Katana extends THREE.Object3D {
    constructor() {
        super();
        var hojaShape = new THREE.Shape();
        hojaShape.moveTo(0, 0);
        hojaShape.lineTo(0, 20);
        hojaShape.lineTo(1, 18);
        hojaShape.lineTo(1, 0);
        var hojaGeo = new THREE.ExtrudeGeometry(hojaShape, {
            depth: 0.2
        });
        hojaGeo.translate(-0.5, 0, 0);
        var texturaMetalica = new THREE.TextureLoader().load("../imgs/blade.jpg");
        texturaMetalica.wrapT = THREE.RepeatWrapping;
        texturaMetalica.repeat.set(1, 1);
        var materialMetalico = new THREE.MeshStandardMaterial({
            color: 0xFF0000,
            roughness: 0.5,
            metalness: 1,
            map: texturaMetalica
        })
        this.hoja = new THREE.Mesh(hojaGeo, materialMetalico);
        this.add(this.hoja);

        var sepMangoHojaGeo = new THREE.BoxGeometry(3, 0.5, 3);
        var materialDetalles = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.9
        })
        this.sepMangoHoja = new THREE.Mesh(sepMangoHojaGeo, materialDetalles);
        this.add(this.sepMangoHoja);

        var mangoShape = new THREE.Shape();
        mangoShape.moveTo(0, 0);
        mangoShape.lineTo(0, 7);
        mangoShape.lineTo(1, 7);
        mangoShape.lineTo(1, 0);
        var mangoGeo = new THREE.ExtrudeGeometry(mangoShape, {
            depth: 0.3
        });
        mangoGeo.translate(-0.5, -7, 0);
        var mangoText = new THREE.TextureLoader().load('../imgs/grip-2.png');
        mangoText.wrapT = THREE.RepeatWrapping;
        mangoText.repeat.set(1, 1);
        var mangoMat = new THREE.MeshStandardMaterial({
            map: mangoText
        })
        this.mango = new THREE.Mesh(mangoGeo, mangoMat);
        this.add(this.mango);

        var detalleShape = new THREE.Shape();
        detalleShape.moveTo(0, 0);
        detalleShape.lineTo(1, 1);
        detalleShape.lineTo(0, 2);
        detalleShape.lineTo(-1, 1);
        var detalleGeo = new THREE.ExtrudeGeometry(detalleShape, {
            depth: 0.6
        });
        detalleGeo.translate(0, -8, -0.15);
        this.detalle = new THREE.Mesh(detalleGeo, materialDetalles);
        this.add(this.detalle);
        this.translateY(8)
        this.scale.set(0.2, 0.2, 0.2);

        this.atacando = false;
        this.puedoAnimar = true;
        this.detenerAnimacion = false;
        this.canHit = false;

        var hitboxGeo = new THREE.BoxGeometry(2, 24, 2);
        hitboxGeo.translate(0, 8, 0);
        var hitboxMat = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0 });
        this.caja = new THREE.Mesh(hitboxGeo, hitboxMat);
        this.add(this.caja);

    }

    interseccionEnemigo(otro) {
        if (this.canHit) {
            var vectorEntreObj = new THREE.Vector2();
            var v_caja = new THREE.Vector3();
            var v_otro = new THREE.Vector3();
            otro.caja.getWorldPosition(v_otro);
            this.caja.getWorldPosition(v_caja);
            vectorEntreObj.subVectors(new THREE.Vector2(v_caja.x, v_caja.z),
                new THREE.Vector2(v_otro.x, v_otro.z));
            return (vectorEntreObj.length() < 8); // se puede revisar
        }
    }

}

export { Katana };