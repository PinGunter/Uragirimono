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
        var cuerpoMat = new THREE.MeshToonMaterial({color: "red"});
        var cuerpoCentral = new THREE.Mesh(cuerpoGeo, cuerpoMat);

        var cuerpoLatGeo1 = new THREE.BoxGeometry(10,5,9);
        cuerpoLatGeo1.translate(0,2.5,0);
        var cuerpoLat1 = new THREE.Mesh(cuerpoLatGeo1,cuerpoMat);

        var cuerpo = new CSG();
        cuerpo.union([cuerpoCentral, cuerpoLat1]); 
        this.cuerpoFinal = cuerpo.toMesh();
      
        
        
        var pathCabeza = new THREE.EllipseCurve(
            0,0,
            5.5,5.5,
            Math.PI/3, 0,
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
        var cabezaMat = new THREE.MeshToonMaterial({color: "cyan"});
        this.cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);


        // var cabezaGeo = new THREE.SphereGeometry(4.5,16,16,0,2*Math.PI,0,Math.PI);
        // var cabezaMat = new THREE.MeshToonMaterial({color: "cyan"}); 
        // cabezaGeo.scale(1,0.5,1);
        // cabezaGeo.rotateZ(Math.PI/4);
        // cabezaGeo.translate(-9,5.5,0);
        // this.cabeza = new THREE.Mesh(cabezaGeo, cabezaMat);

        this.add(this.rueda);
        this.add(this.cuerpoFinal);       
        this.add(this.cabeza);
    }


    
    update(){
        this.rueda.rotation.z -= 0.01;
    }
}

export {Motobug}