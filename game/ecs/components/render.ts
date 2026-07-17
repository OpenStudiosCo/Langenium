// components/render.ts

import * as THREE from 'three';

export interface Render {
    mesh: THREE.Object3D | null;
    object: String;
}
