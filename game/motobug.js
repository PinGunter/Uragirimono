import * as THREE from '../libs/three.module.js'
import {CSG} from '../libs/CSG-v2.js'


class Motobug extends THREE.Object3D{
    constructor(){
        super();
        // la rueda
        var ruedaGeo = new THREE.TorusGeometry(5, 2.75, 16, 100);
        var texturaRueda = new THREE.TextureLoader().load("../imgs/tire.jpg");
        texturaRueda.wrapS = THREE.RepeatWrapping;
        texturaRueda.wrapT = THREE.RepeatWrapping;
        texturaRueda.repeat.set(1, 1);
        var ruedaMat = new THREE.MeshToonMaterial({color: "grey", map: texturaRueda});

        this.rueda = new THREE.Mesh(ruedaGeo, ruedaMat);

        // el cuerpo

        var curvaCuerpo = new THREE.EllipseCurve(
            0,0,
            5,5,
            -Math.PI, 0,
            true,
            0
        )       
        var puntos2d = curvaCuerpo.getPoints(50);
        var formaCuerpo = new THREE.Shape(puntos2d);
        var puntos3d = [];
        puntos2d.forEach(p => {
            puntos3d.push(new THREE.Vector3(p.x, p.y, 0));
        });
        var path = new THREE.CatmullRomCurve3(puntos3d);
        var cuerpoGeo = new THREE.ExtrudeGeometry(formaCuerpo, {extrudePath: path, steps: 50});
        var cuerpoMat = new THREE.MeshToonMaterial({color: 0xe6202a});
        var cuerpoCentral = new THREE.Mesh(cuerpoGeo, cuerpoMat);

        var cuerpoLatGeo = new THREE.BoxGeometry(10,5,9);
        cuerpoLatGeo.translate(0,2.5,0);
        var cuerpoLat = new THREE.Mesh(cuerpoLatGeo,cuerpoMat);

        var cuerpo = new CSG();
        cuerpo.union([cuerpoCentral, cuerpoLat]); 
        this.cuerpoFinal = cuerpo.toMesh();
      
        
        // la cabezaa
        var pathCabeza = new THREE.EllipseCurve(
            0,0,
            5.5,5.5,
            Math.PI/3, 0.2,
            true,
            0
        )       
        puntos2d = pathCabeza.getPoints(50);
        var formaCabeza = new THREE.Shape(curvaCuerpo.getPoints(50));
        puntos3d = [];
        puntos2d.forEach(p => {
            puntos3d.push(new THREE.Vector3(p.x, p.y, 0));
        });
        path = new THREE.CatmullRomCurve3(puntos3d);
        var cabezaGeo = new THREE.ExtrudeGeometry(formaCabeza, {extrudePath: path, steps: 50});
        var cabezaMat = new THREE.MeshToonMaterial({color: 0x037bfc});
        this.cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);


        // las manchas negras

        var decoGeo1 = new THREE.CylinderGeometry(2,2,0.75,16,16);
        var decoMat = new THREE.MeshToonMaterial({color: 0x333232});
        decoGeo1.rotateX(Math.PI/3);
        decoGeo1.translate(0,7.5,4.5);
        this.deco1 = new THREE.Mesh(decoGeo1, decoMat);

        
        var decoGeo2 = new THREE.CylinderGeometry(2,2,0.75,16,16);
        decoGeo2.rotateX(-Math.PI/3);
        decoGeo2.translate(0,7.5,-4.5);
        this.deco2 = new THREE.Mesh(decoGeo2, decoMat);
        
        var decoGeo3 = new THREE.CylinderGeometry(2,2,0.75,16,16);
        decoGeo3.rotateX(Math.PI/4);
        decoGeo3.rotateZ(Math.PI/2);
        decoGeo3.rotateX(-Math.PI/5);
        decoGeo3.translate(-8,4,3);
        this.deco3 = new THREE.Mesh(decoGeo3, decoMat);

        var decoGeo4 = new THREE.CylinderGeometry(2,2,0.75,16,16);
        decoGeo4.rotateX(-Math.PI/4);
        decoGeo4.rotateZ(Math.PI/2);
        decoGeo4.rotateX(Math.PI/5);
        decoGeo4.translate(-8,4,-3);
        this.deco4 = new THREE.Mesh(decoGeo4, decoMat);

        this.decoraciones = new THREE.Group();
        this.decoraciones.add(this.deco1);
        this.decoraciones.add(this.deco2);
        this.decoraciones.add(this.deco3);
        this.decoraciones.add(this.deco4);

        // los ojos
        var ojoGeo1 = new THREE.SphereGeometry(1.5,16,16);
        ojoGeo1.translate(8, 6, -2);
        var ojoMat = new THREE.MeshToonMaterial({color: "white"});
        this.ojo1 = new THREE.Mesh(ojoGeo1, ojoMat);

        var ojoGeo2 = new THREE.SphereGeometry(1.5,16,16);
        ojoGeo2.translate(8, 6, 2);
        this.ojo2 = new THREE.Mesh(ojoGeo2, ojoMat);

        var pupGeo1 = new THREE.SphereGeometry(.5,16,16);
        pupGeo1.translate(9.5,6, -2);
        var pupMat = new THREE.MeshToonMaterial({color: "black"});
        this.pup1 = new THREE.Mesh(pupGeo1, pupMat);

        var pupGeo2 = new THREE.SphereGeometry(.5,16,16);
        pupGeo2.translate(9.5,6, 2);
        this.pup2 = new THREE.Mesh(pupGeo2, pupMat);


        // los "dientes"

        var dienteShape = new THREE.Shape();
        dienteShape.moveTo(1,0);
        dienteShape.lineTo(0,-3);
        dienteShape.lineTo(-1,0);
        var dienteGeo1 = new THREE.ExtrudeGeometry(dienteShape, {depth: .5});
        dienteGeo1.rotateY(Math.PI/2);
        dienteGeo1.translate(10,3,-2);
        dienteGeo1.rotateX(Math.PI/5);
        this.diente1 = new THREE.Mesh(dienteGeo1, ojoMat);

        var dienteGeo2 = new THREE.ExtrudeGeometry(dienteShape, {depth: .5});
        dienteGeo2.rotateY(Math.PI/2);
        dienteGeo2.translate(10,3,2);
        dienteGeo2.rotateX(-Math.PI/5);
        this.diente2 = new THREE.Mesh(dienteGeo2, ojoMat);


        // los tubos de escape
        var tuboGeo1 = new THREE.CylinderGeometry(1,1, 5, 16, 16);
        var tuboMat = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("../imgs/tubo.jpg"), metalness: 1});
        tuboGeo1.rotateZ(-Math.PI/2 - Math.PI/6);
        tuboGeo1.translate(-8,3,-5);
        this.tubo1 = new THREE.Mesh(tuboGeo1, tuboMat);

        var tuboGeo2 = new THREE.CylinderGeometry(1,1, 5, 16, 16);
        tuboGeo2.rotateZ(-Math.PI/2 - Math.PI/6);
        tuboGeo2.translate(-8,3,5);
        this.tubo2 = new THREE.Mesh(tuboGeo2, tuboMat);

        // los brazos
        var brazoGeo1 = new THREE.CylinderGeometry(0.5,0.5,5,16,16);
        brazoGeo1.rotateX(Math.PI/2);
        brazoGeo1.translate(2,3,4);
        var brazoMat = new THREE.MeshToonMaterial({color: "yellow"});
        this.brazo1 = new THREE.Mesh(brazoGeo1, brazoMat);
        
        // añadir al objeto
        this.add(this.rueda);
        this.add(this.cuerpoFinal);       
        this.add(this.cabeza);
        this.add(this.ojo1);
        this.add(this.ojo2);
        this.add(this.pup1);
        this.add(this.pup2);
        this.add(this.decoraciones);
        this.add(this.diente1);
        this.add(this.diente2);
        this.add(this.tubo1);
        this.add(this.tubo2);
        this.add(this.brazo1);


        // caja para las colisiones
        this.caja = new THREE.Mesh(
            new THREE.BoxGeometry(13,13,13),
            new THREE.MeshNormalMaterial({transparent: true, opacity: 0})
        )
        this.caja.name = "cajaMotobug";
        this.add(this.caja);

        this.scale.set(0.5,0.5,0.5)
    }


    
    update(){
        this.rueda.rotation.z -= 0.01;
    }
}

export {Motobug}