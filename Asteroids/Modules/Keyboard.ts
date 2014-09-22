module Keyboard {
    var keyState = new Array();
    var keyLock = new Array();

    window.addEventListener("keydown", ((event: KeyboardEvent) => {
        var key: number = (event.which == null ? event.keyCode : event.which);
        keyState[key] = true;
    }).bind(Keyboard));

    window.addEventListener("keyup",((event: KeyboardEvent) => {
        var key: number = (event.which == null ? event.keyCode : event.which);
        keyState[key] = false;
    }).bind(Keyboard));

    export function getState(key: Key) {
        return (keyState[key] !== undefined && keyState[key] !== false);
    }

    // Auto-repeat prevention

    export function lockKey(key: Key) {
        keyLock[key] = true;
    }

    export function unlockKey(key: Key) {
        keyLock[key] = false;
    }

    export function isLocked(key: Key) {
        return (keyLock[key] !== undefined && keyLock[key] !== false);
    }

    export class Handler {
        private eventType: string;
        private handler;

        constructor(eventType: string, eventHandler: any, self: any) {
            this.eventType = eventType;
            this.handler = eventHandler.bind(self);
        }

        listen() {
            window.addEventListener(this.eventType, this.handler);
        }

        release() {
            window.removeEventListener(this.eventType, this.handler);
        }
    }

    export enum Key {
        Left = 37,
        Up = 38,
        Right = 39,
        Space = 32,
        Backspace = 8,
        Enter = 13,
        Tab = 9,
        Escape = 27,
        MKey = 77,
        CKey = 67,
        WKey = 87,
        AKey = 65,
        DKey = 68
    }
}