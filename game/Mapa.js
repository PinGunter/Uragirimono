import * as THREE from '../libs/three.module.js';
import {Columna} from './Columna.js';

class Mapa extends THREE.Object3D{
    constructor() {
        super();
        this.hitboxes = [];

        var texturaPared = new THREE.TextureLoader().load('../imgs/pared.jpg');
        texturaPared.wrapS = THREE.RepeatWrapping;
        texturaPared.repeat.set(6,1);
        var materialPared = new THREE.MeshStandardMaterial({map: texturaPared});

        var paredLgeo = new THREE.BoxGeometry(1,10,200);
        paredLgeo.translate(-100,4,0);

        this.paredL = new THREE.Mesh(paredLgeo, materialPared);
        this.add(this.paredL);

        var hitboxMat = new THREE.MeshStandardMaterial({color: 0xff0000, transparent: true, opacity: 0.8})

        var cajaLgeo = new THREE.BoxGeometry(5,10,200);
        this.cajaL = new THREE.Mesh(cajaLgeo, hitboxMat);
        this.cajaL.name = "paredL"
        this.cajaL.position.set(-100,4,0)
        this.add(this.cajaL);

        var paredRgeo = new THREE.BoxGeometry(1,10,200);
        paredRgeo.translate(100,4,0);
        this.paredR = new THREE.Mesh(paredRgeo, materialPared);
        this.add(this.paredR)

        var cajaRgeo = new THREE.BoxGeometry(5,10,200);
        this.cajaR = new THREE.Mesh(cajaRgeo, hitboxMat);
        this.cajaR.position.set(100,4,0)
        this.cajaR.name = "paredR";
        this.add(this.cajaR);

        var paredTgeo = new THREE.BoxGeometry(1,10,200);
        paredTgeo.rotateY(Math.PI/2);   
        paredTgeo.translate(0,4,100);
        this.paredT = new THREE.Mesh(paredTgeo, materialPared);
        this.add(this.paredT);

        var cajaTgeo = new THREE.BoxGeometry(5,10,200);
        cajaTgeo.rotateY(Math.PI/2);
        this.cajaT = new THREE.Mesh(cajaTgeo, hitboxMat);
        this.cajaT.name = "paredT";
        this.cajaT.position.set(0,4,100)
        this.add(this.cajaT);

        var paredBgeo = new THREE.BoxGeometry(1,10,200);
        paredBgeo.rotateY(Math.PI/2);
        paredBgeo.translate(0,4,-100);
        this.paredB = new THREE.Mesh(paredBgeo, materialPared);
        this.add(this.paredB);

        var cajaBgeo = new THREE.BoxGeometry(5,10,200);
        cajaBgeo.rotateY(Math.PI/2);
        this.cajaB = new THREE.Mesh(cajaBgeo, hitboxMat);
        this.cajaB.position.set(0,4,-100)
        this.cajaB.name = "paredB";
        this.add(this.cajaB);

        var sueloGeo = new THREE.BoxGeometry(200,1,200);
        sueloGeo.translate(0,-0.5,0);
        var texturaSuelo = new THREE.TextureLoader().load('../imgs/suelo.jpg');
        texturaSuelo.wrapS = THREE.RepeatWrapping;
        texturaSuelo.wrapT = THREE.RepeatWrapping;
        texturaSuelo.repeat.set(5,5);
        var materialSuelo = new THREE.MeshStandardMaterial({map: texturaSuelo});
        this.suelo = new THREE.Mesh(sueloGeo, materialSuelo);
        this.add(this.suelo);


        this.columnas = [];
        var c1 = new Columna();
        var c2 = new Columna();
        var c3 = new Columna();
        var c4 = new Columna();
        var c5 = new Columna();
        var c6 = new Columna();


        c1.translateX(-30);
        c1.translateZ(-30);
        this.add(c1);
        this.columnas.push(c1);
        c2.translateX(-70);
        c2.translateZ(30);
        this.add(c2);
        this.columnas.push(c2);
        c3.translateX(10);
        c3.translateZ(-80);
        this.add(c3);
        this.columnas.push(c3);

        c4.translateX(30);
        c4.translateZ(30);
        this.add(c4);
        this.columnas.push(c4);
        c5.translateX(70);
        c5.translateZ(-30);
        this.add(c5);
        this.columnas.push(c5);
        c6.translateX(-10);
        c6.translateZ(80);
        this.add(c6);
        this.columnas.push(c6);

        this.hitboxes.push(this.cajaL);
        this.hitboxes.push(this.cajaR);
        this.hitboxes.push(this.cajaT);
        this.hitboxes.push(this.cajaB);
        this.columnas.forEach(c => {
            this.hitboxes.push(c.col);
        })

        // luces
        this.luz1 = new THREE.PointLight(0xf2870c, 1, 40);
        this.luz1.position.set(-99,8,0);

        this.luz2 = new THREE.PointLight(0xf2870c, 1, 40);
        this.luz2.position.set(99,8,0);

        this.luz3 = new THREE.PointLight(0xf2870c, 1, 40);
        this.luz3.position.set(0,8,99);

        this.luz4 = new THREE.PointLight(0xf2870c, 1, 40);
        this.luz4.position.set(0,8,-99);

        this.add(this.luz1);
        this.add(this.luz2);
        this.add(this.luz3);
        this.add(this.luz4);


    }
}

export {Mapa};