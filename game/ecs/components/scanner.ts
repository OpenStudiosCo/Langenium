// components/scanner.ts

import { ScanState } from "../types";

export interface Scanner {
    range: number;
    fieldOfView: number;

    targets: Record<string, ScanState>;
}
