/**
 * Actor Base
 *
 * Provides an instance of an actor that can be attached to game objects.
 *
 * Behaviours such as bot AI, path finding and combat are attached to the entity of actors.
 */

import * as YUKA from 'yuka';

export default class BaseActor {

    public entity: YUKA.GameEntity; // set by instantiator.

    public score: { kills: number; deaths: number }   = { kills: 0, deaths: 0 };
    public faction: string = 'winthrom';
    public standing: { union: number, winthrom: number, zaar: number } = { union: 0.5, winthrom: 1.0, zaar: 0.0 }

    public controls: {
        changing: boolean,
        forward: boolean;
        back: boolean;
        jump: boolean;
        crouch: boolean;
        turnLeft: boolean;
        turnRight: boolean;
    } = {
        changing: false,
        forward: false,
        back: false,
        jump: false,
        crouch: false,
        turnLeft: false,
        turnRight: false
    };

    constructor( ) {

    }

}
