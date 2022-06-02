import * as THREE from '../libs/three.module.js';

class Columna extends THREE.Object3D{
    constructor() {
        super();

        var texturaPared = new THREE.TextureLoader().load('../imgs/pared.jpg');
        texturaPared.wrapT= THREE.RepeatWrapping;
        texturaPared.repeat.set(1,1);
        var materialPared = new THREE.MeshStandardMaterial({map: texturaPared, side: THREE.DoubleSide});
        var paredGeo = new THREE.BoxGeometry(12,10,12,1,1 );
        paredGeo.rotateY(Math.PI/4)
        paredGeo.translate(0,5,0);
        this.col = new THREE.Mesh(paredGeo, materialPared);
        this.col.name ="columna"
        this.add(this.col);

    }
}

export {Columna}