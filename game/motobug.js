import * as THREE from '../libs/three.module.js'

class Motobug extends THREE.Object3D{
    constructor(){
        super();
        var ruedaGeo = new THREE.TorusGeometry(2, 1, 16, 100);
        var ruedaMat = new THREE.MeshToonMaterial({color: "grey"});

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
        this.cuerpo = new THREE.Mesh(cuerpoGeo, cuerpoMat);


        this.add(this.rueda);
        this.add(this.cuerpo);
        
    }


    
    update(){
        this.rotation.y += 0.01;
    }
}

export {Motobug}