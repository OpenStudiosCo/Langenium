import { Transform } from "../components/Transform";
import { Velocity } from "../components/Velocity";

export function movementSystem(entities: Map<string, any>, deltaMs: number) {
    const dt = deltaMs / 1000; // convert ms to seconds

    for (const entity of entities.values()) {
        const transform = entity.components.Transform as Transform | undefined;
        const velocity = entity.components.Velocity as Velocity | undefined;

        if (transform && velocity) {
            // Linear movement
            transform.position.x += velocity.linear.x * dt;
            transform.position.y += velocity.linear.y * dt;
            transform.position.z += velocity.linear.z * dt;

            // Angular movement
            if (velocity.angular) {
                transform.rotation.x += velocity.angular.x * dt;
                transform.rotation.y += velocity.angular.y * dt;
                transform.rotation.z += velocity.angular.z * dt;
            }
        }
    }
}
