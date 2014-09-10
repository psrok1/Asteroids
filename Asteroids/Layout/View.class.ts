module Layout {
    export class View extends PIXI.Stage {
        private paused: boolean = true;
        private keyDownHandler: Keyboard.Handler;
        private keyUpHandler: Keyboard.Handler;

        constructor(backgroundColor: number = 0) {
            super(backgroundColor);
            this.keyDownHandler = new Keyboard.Handler("keydown", this.onKeyDown, this);
            this.keyUpHandler = new Keyboard.Handler("keyup", this.onKeyUp, this);
        }

        onKeyDown(event: KeyboardEvent) { }
        onKeyUp(event: KeyboardEvent) { }
        update() { }
        pause() {
            this.paused = true;
            this.keyDownHandler.release();
            this.keyUpHandler.release();
        }
        resume() {
            this.paused = false;
            this.keyDownHandler.listen();
            this.keyUpHandler.listen();
        }
        isPaused() { return this.paused; }
    }
} 