/* Personaje principal del juego */

import * as THREE from '../libs/three.module.js';
import { Ronin3D } from './Ronin3d.js';

class Ronin{
    constructor(){
        this.model = new Ronin3D();
    }
}