// types.ts

import { Name } from "./components/name";

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface AABB {
    halfSize: Vec3;
}

export interface ScanState {
    name: Name;
    scanTime: number;
    lostTime: number;

    tracking: boolean;
    locking: boolean;
    locked: boolean;
}
