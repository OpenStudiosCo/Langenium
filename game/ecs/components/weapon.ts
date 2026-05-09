// components/weapon.ts

export interface Weapon {
    // Origin mesh that fired the missile.
    mesh;

    // Scanner system that determine where we're firing.
    scanner;

    // Animation.
    last;
    timeout;
}
