import * as THREE from '../libs/three.module.js'
import {CSG} from '../libs/CSG-v2.js'


class Motobug extends THREE.Object3D{
    constructor(){
        super();
        var ruedaGeo = new THREE.TorusGeometry(5, 2.75, 16, 100);
        var texture = new THREE.TextureLoader().load("../imgs/tire.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        var ruedaMat = new THREE.MeshToonMaterial({color: "grey", map: texture});

        this.rueda = new THREE.Mesh(ruedaGeo, ruedaMat);



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

        this.add(this.rueda);
        this.add(this.cuerpoFinal);       
        this.add(this.cabeza);
        this.add(this.decoraciones);
    }


    
    update(){
        this.rueda.rotation.z -= 0.01;
    }
}

export {Motobug}