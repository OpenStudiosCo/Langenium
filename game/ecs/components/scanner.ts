// components/scanner.ts

import { ScanState } from "../types";

export interface Scanner {
    range: number;
    fieldOfView: number;

    targets: Array<ScanState>;

    // Animation.
    last;
    timeout;
}
