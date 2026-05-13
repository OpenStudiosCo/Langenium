import { AI } from "../components/AI";
import { Transform } from "../components/Transform";

import * as YUKA from 'yuka';

export function aiSystem(entities: Map<string, any>, deltaMs: number) {
    const dt = deltaMs / 1000; // convert ms to seconds

    for (const entity of entities.values()) {
        const transform = entity.components.Transform as Transform | undefined;
        const ai = entity.components.AI as AI | undefined;

        if (transform && ai) {
            // Reverse sync for now so things are in the correct place until movement is added
            ai.entity.position.x = transform.position.x;
            ai.entity.position.y = transform.position.y;
            ai.entity.position.z = transform.position.z;

        }
    }
}
