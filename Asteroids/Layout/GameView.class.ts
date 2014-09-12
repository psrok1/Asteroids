﻿module Layout {
    export class GameView extends View {
        private sky: Sky;
        private world: Objects.World;
        private camera: Camera;
        private effects: GameViewEffect[] = new Array()
        private blurFilter: PIXI.BlurFilter;
        private grayFilter: PIXI.GrayFilter;
        private currentMission: Mission;
        private introNotification: IntroNotification;
        private introStep: number;
        private introClock: number;
        
        constructor() {
            super();
            this.sky = new Sky(this);
            // Filters
            this.blurFilter = new PIXI.BlurFilter();
            this.grayFilter = new PIXI.GrayFilter();
            this.blurFilter.blur = 0;
            this.grayFilter.gray = 0;
            this.filters = [this.blurFilter, this.grayFilter];
            // Effects
            this.registerEffect("distortion", new DistortionEffect(this));
            this.registerEffect("criticalDamage", new CriticalDamageBlur(this));
            this.registerEffect("gameOver", new GameOverEffect(this));            
        }

        startMission() {
            this.currentMission = Player.getCurrentMission();
            this.world = new Objects.World(this, this.currentMission);
            this.camera = new Camera(this.sky, this.world);
            this.resetEffects();
            this.introNotification = new IntroNotification(this);
            this.introStep = -1;
            this.nextIntroStep();
        }

        endMission() {
            this.world.pause();
            for (var objectID in this.world.objects)
                this.removeChild(this.world.objects[objectID].renderObject);
        }

        nextIntroStep() {
            this.introClock = 0;
            if (++this.introStep >= this.currentMission.introData.length) {
                this.world.endIntroPhase();
                this.camera.setFocus(App.DebugPresets.FocusOnAttacker ?
                    this.world.getObjectByName("attacker") : this.world.player);
                this.introNotification.hide();
                return;
            }
            var introData = this.currentMission.introData[this.introStep];
            this.introNotification.setMessage(introData.description);
            this.camera.setFocus(this.world.getObjectByName(introData.focusOn));
        }

        private introUpdate() {
            if (this.world.isIntroPhase()) {
                this.introClock++;
                if (this.introClock >= this.currentMission.introData[this.introStep].duration)
                    this.nextIntroStep();
            }
        }

        private registerEffect(name: string, effect: GameViewEffect) {
            if (this.effects[name])
                throw new Error("Error: GameViewEffect "+name+" duplicated");
            this.effects[name] = effect;
        }
        private updateEffects() {
            for (var effectName in this.effects)
                this.effects[effectName].update();
        }
        private resetEffects() {
            for (var effectName in this.effects)
                this.effects[effectName].reset();
        }
        onKeyDown(event: KeyboardEvent) {
            var key: number = (event.which == null ? event.keyCode : event.which);
            if (key == Keyboard.Key.Space)
                if ((<GameOverEffect>this.effects["gameOver"]).isGameOver()) {
                    (<GameOverEffect>this.effects["gameOver"]).reset();
                    ViewManager.getInstance().switchView("main");
                } else if (this.world.isIntroPhase()) {
                    this.nextIntroStep();
                } else if (!Keyboard.isLocked(Keyboard.Key.Space)) {
                    this.world.player.shot();
                    Keyboard.lockKey(Keyboard.Key.Space);
                }
            if (key == Keyboard.Key.Enter)
                this.world.player.rocketShot();
        }
        onKeyUp(event: KeyboardEvent) {
            var key: number = (event.which == null ? event.keyCode : event.which);
            if (key == Keyboard.Key.Space)
                Keyboard.unlockKey(Keyboard.Key.Space);
        }
        updatePlayerSteering() {
            var player = this.world.player;
            if (!player)
                return;
            if (Keyboard.getState(Keyboard.Key.Left))
                player.rotate(-Math.PI / 36);
            if (Keyboard.getState(Keyboard.Key.Right))
                player.rotate(Math.PI / 36);
            if (Keyboard.getState(Keyboard.Key.Up)) {
                var accelerationForce: Vector = new Vector(0.25, 0);
                accelerationForce.rotation = player.getRotation();
                player.applyForce(accelerationForce);
            }
        }
        update() {
            this.updatePlayerSteering();
            this.world.update();
            this.camera.update();
            this.updateEffects();
            this.introUpdate();
        }
        shakeCamera() {
            this.camera.shake();
        }
        doDistortion() {
            this.effects["distortion"].play();
        }
        doCriticalBlur() {
            this.effects["criticalDamage"].play();
        }
        onGameOver() {
            this.effects["gameOver"].play();
        }
        setBlur(blur: number) {
            this.blurFilter.blur = blur;
        }
        setGray(gray: number) {
            this.grayFilter.gray = gray;
        }
        resume() {
            this.startMission();
            super.resume();
        }
        pause() {
            super.pause();
            this.endMission();
        }
    }

    class Camera {
        private sky: Sky;
        private world: Objects.World;

        private focusedObject: Objects.GameObject = null;
        private cameraPosition: TorusPoint;
        private maxCameraVelocity: number = 25;
        private shakeEnabled: number = 0;

        constructor(sky: Sky, world: Objects.World, cameraPosition: IPoint = { x: 0, y: 0 }) {
            this.sky   = sky;
            this.world = world;
            this.cameraPosition = new TorusPoint(cameraPosition.x, cameraPosition.y, world.width, world.height);
        }
        setFocus(object: Objects.GameObject) {
            this.focusedObject = object;
        }
        private moveCamera(where: TorusPoint) {
            var rel: RelativeTorusPoint = where.getRelative(this.cameraPosition);
            var movement: Vector = new Vector(rel.x, rel.y);
            if (movement.length > this.maxCameraVelocity)
                movement.length = this.maxCameraVelocity;
            this.sky.move(movement);
            this.cameraPosition.move(movement);
        }
        update() {
            var SHAKE_FORCE = 5;
            if (this.focusedObject)
                this.moveCamera(this.focusedObject.getPosition());
            if (this.shakeEnabled-- > 0) {
                var shakeMovement: Vector = new Vector(randomFromRange(-SHAKE_FORCE, SHAKE_FORCE), randomFromRange(-SHAKE_FORCE, SHAKE_FORCE));
                this.sky.move(shakeMovement);
                this.cameraPosition.move(shakeMovement);
            }
            for (var object in this.world.objects)
                this.world.objects[object].applyCameraPosition(this.cameraPosition);
        }
        shake() {
            this.shakeEnabled = 12;
        }
    }

    class Sky {
        private layers: PIXI.TilingSprite[] = new Array();
        private layersScale: number[] = new Array();

        private addLayer(texture: PIXI.Texture, parent: View, scale: number): number {
            var sprite: PIXI.TilingSprite = new PIXI.TilingSprite(texture, 600, 600);
            this.layers.push(sprite);
            this.layersScale.push(scale);
            parent.addChild(sprite);
            return this.layers.length - 1;
        }
        constructor(parent: View) {
            this.addLayer(Resources.getObject("backgroundLayer0"), parent, 0.25);
            this.addLayer(Resources.getObject("backgroundLayer1"), parent, 1);
        }
        move(vec: Vector) {
            for (var layer = 0; layer < this.layers.length; ++layer) {
                this.layers[layer].tilePosition.x -= vec.x * this.layersScale[layer];
                this.layers[layer].tilePosition.y -= vec.y * this.layersScale[layer];
            }
        }
    }

    interface GameViewEffect {
        update();
        play();
        reset();
        isPlayed(): boolean;
    }
    class DistortionEffect implements GameViewEffect {
        private view: GameView;
        private sprite: PIXI.Sprite;
        private frame: number = 0;
        private frameMax: number = 7;
        private played: boolean = false;

        private nextFrame() {
            if (this.frame >= this.frameMax)
                return;
            var resID = "distortion1" + (++this.frame);
            this.sprite.setTexture(Resources.getObject(resID));
        }
        constructor(view: GameView) {
            this.view = view;
            var resID = "distortion10";
            this.sprite = new PIXI.Sprite(Resources.getObject(resID));
            this.sprite.position.x = this.sprite.position.y = 0;
            this.sprite.anchor.x = this.sprite.anchor.y = 0;
        }
        update() {
            if (this.played) {
                if (this.frame >= this.frameMax) {
                    this.view.removeChild(this.sprite);
                    this.played = false;
                    this.view.setBlur(0);
                } else
                    this.nextFrame();
            }
        }
        play() {
            this.frame = -1;
            this.nextFrame();
            if(!this.played)
                this.view.addChild(this.sprite);
            this.played = true;
            this.view.setBlur(16);
        }
        reset() {
            if (this.played) {
                this.view.removeChild(this.sprite);
                this.played = false;
            }
            this.view.setBlur(0);
        }
        isPlayed(): boolean {
            return this.played;
        }
    }
    class CriticalDamageBlur implements GameViewEffect {
        private clock: number = 0;
        private view: GameView;
        private played: boolean = false;

        constructor(view: GameView) {
            this.view = view;
        }
        update() {
            if (!this.played)
                return;
            if (this.clock++ < 30)
                this.view.setBlur(20);
            else {
                this.view.setBlur(20 - (this.clock - 30) * 0.2);
                if (this.clock > 130)
                    this.played = false;
            }
        }
        play() {
            this.clock = 0;
            this.played = true;
        }
        reset() {
            this.played = false;
            this.clock = 0;
            this.view.setBlur(0);
        }
        isPlayed(): boolean {
            return this.played;
        }
    }
    class GameOverEffect implements GameViewEffect {
        private clock: number = 0;
        private view: GameView;
        private played: boolean = false;
        private gameOverText: PIXI.Text;

        constructor(view: GameView) {
            this.view = view;
            this.gameOverText = new PIXI.Text("GAME OVER", {
                font: "32px Digital-7",
                fill: "white"
            });
            this.gameOverText.anchor = new PIXI.Point(0.5, 0.5);
            this.gameOverText.position = new PIXI.Point(300, 300);
            this.gameOverText.visible = false;
            this.view.addChild(this.gameOverText);
        }
        update() {
            if (!this.played)
                return;
            if (this.clock >= 100) {
                this.gameOverText.visible = true;
                this.played = false;
                return;
            }
            this.clock++;
            this.view.setBlur(this.clock * 0.05);
            this.view.setGray(this.clock * 0.01);
        }
        play() {
            this.clock = 0;
            this.played = true;
        }
        isPlayed(): boolean {
            return this.played;
        }
        reset() {
            this.gameOverText.visible = false;
            this.view.setBlur(0);
            this.view.setGray(0);
        }
        isGameOver() {
            return this.gameOverText.visible;
        }
    }

    class IntroNotification {
        private parentView: GameView;
        private box: PIXI.Graphics;
        private message: PIXI.Text;
        private skip: PIXI.Text;

        constructor(parent: GameView) {
            this.parentView = parent;
            this.box = new PIXI.Graphics();
            this.box.beginFill(0x000020, 0.6);
            this.box.lineStyle(1, 0x404060, 1);
            this.box.drawRect(0, 0, 536, 80);
            this.box.endFill();
            this.box.position = new PIXI.Point(32, 488);

            this.message = new PIXI.Text("Use arrow keys for steering and Space for shooting.\nIn further missions you can also use numeric keys for launching rockets.",
                {
                    font: "12px monospace",
                    fill: "white",
                    align: "center",
                    wordWrap: true,
                    wordWrapWidth: 472
                });
            this.message.anchor = new PIXI.Point(0.5, 0.5);
            this.message.position = new PIXI.Point(268, 34);
            this.box.addChild(this.message);

            this.skip = new PIXI.Text("SKIP >>>", {
                font: "12px Digital-7",
                fill: "white"
            });
            this.skip.interactive = true;
            this.skip.mousedown = this.skip.touchstart = this.parentView.nextIntroStep.bind(this.parentView);
            this.skip.position = new PIXI.Point(490, 60);
            this.box.addChild(this.skip);
            this.parentView.addChild(this.box);
        }

        setMessage(message: string) {
            this.message.setText(message);
        }

        hide() {
            this.skip.mousedown = this.skip.touchstart = null;
            this.parentView.removeChild(this.box);
        }
    }
}