// types.ts

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface AABB {
    halfSize: Vec3;
}

export interface ScanState {
    entityId: string;
    scanTime: number;
    lostTime: number;

    tracking: boolean;
    locking: boolean;
    locked: boolean;
}
