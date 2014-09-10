module Layout {
    export class StartView extends View {
        private logoSprite: PIXI.Sprite;
        private sky: Stars;
        private startButton: PIXI.Text;
        private enterNameLabel: PIXI.Text;
        private nameField: PIXI.Text;
        private namePlayer: string = "";
        private introPhase: number = 0;
        private blink: boolean = true;
        private enterName: boolean = false;

        onCoinInserted = () => {
            // Bugfix: Persistent interactivity of startButton area
            this.startButton.mousedown = this.startButton.touchstart = null;
            this.startButton.interactive = false;
            if (!Player.existInStorage()) {
                this.askForName();
            } else {
                var viewManager = Layout.ViewManager.getInstance();
                Player.load();
                viewManager.switchView("main");
            }
        };

        onKeyDown(event: KeyboardEvent) {
            var key: number = (event.which == null ? event.keyCode : event.which);
            if (this.introPhase < 2)
                return;
            if (this.enterName) {
                if (key >= 65 && key <= 90) {
                    var char = String.fromCharCode(key);
                    if (this.namePlayer.length < 3)
                        this.namePlayer += char;
                    else
                        this.namePlayer = this.namePlayer.substring(0, 2) + char;
                } else if (key === Keyboard.Key.Backspace) {
                    if (this.namePlayer.length > 0)
                        this.namePlayer = this.namePlayer.slice(0, -1);
                } else if (key === Keyboard.Key.Enter) {
                    Player.create(this.namePlayer);
                    this.onCoinInserted();
                }
                if (this.namePlayer.length === 3)
                    this.enterNameLabel.setText("AND PRESS ENTER");
                else
                    this.enterNameLabel.setText("ENTER YOUR NAME");
                var nameField = "";
                for (var i = 0; i < 3; i++)
                    nameField += (i < this.namePlayer.length ? this.namePlayer[i] : "_") +
                                 (i < 2 ? " " : "");
                this.nameField.setText(nameField);
            } else if (key === Keyboard.Key.Space)
                this.onCoinInserted();
        }
        constructor() {
            super();
            this.sky = new Stars(this);
            var logoTexture: PIXI.Texture = PIXI.Texture.fromImage("Sprites/logo.png");
            this.logoSprite = new PIXI.Sprite(logoTexture);
            this.logoSprite.position.x = 68;
            this.logoSprite.position.y = 200;
            this.addChild(this.logoSprite);
        }
        createStartButton() {
            this.startButton = new PIXI.Text("INSERT COIN TO CONTINUE", {
                font: "32px Digital-7",
                fill: "white"
            });
            this.startButton.alpha = 0;
            this.startButton.position.x = 300;
            this.startButton.anchor.x = 0.5;
            this.startButton.position.y = 400;
            this.startButton.interactive = true;
            this.startButton.mousedown = this.startButton.touchstart = this.onCoinInserted;
            this.startButton.mouseover = (() => {
                this.blink = false;
            }).bind(this);
            this.startButton.mouseout = (() => {
                this.blink = true;
            }).bind(this);
            this.addChild(this.startButton);
        }
        askForName() {
            this.enterName = true;
            this.enterNameLabel = new PIXI.Text("ENTER YOUR NAME", {
                font: "32px Digital-7",
                fill: "white"
            });
            this.nameField = new PIXI.Text("_ _ _", {
                font: "32px Digital-7",
                fill: "white"
            });
            this.enterNameLabel.anchor.x = this.nameField.anchor.x = 0.5;
            this.enterNameLabel.position.x = this.nameField.position.x = 300;
            this.enterNameLabel.position.y = 260;
            this.nameField.position.y = 320;
            this.addChild(this.enterNameLabel);
            this.addChild(this.nameField);
            this.startButton.visible = false;
        }
        update(): void {
            switch (this.introPhase) {
                case 0:
                    if (this.logoSprite.alpha > 0)
                        this.logoSprite.alpha -= 0.02;
                    else {
                        this.introPhase = 1;
                        this.logoSprite.position.y = 100;
                        this.createStartButton();
                    }
                    break;
                case 1:
                    if (this.sky.opacity < 1) {
                        this.sky.opacity += 0.02;
                        this.logoSprite.alpha += 0.02;
                    } else
                        this.introPhase = 2;
                    break;
            }
            if (this.introPhase >= 2 && !this.enterName) {
                if (!this.blink)
                    this.startButton.alpha = 1;
                else if (this.introPhase++ % 20 === 0)
                    this.startButton.alpha = (this.startButton.alpha + 1) % 2;
            }
            this.sky.move({ x: -1, y: -1 });
        }
    }

    class Stars {
        private stars: PIXI.TilingSprite;

        constructor(parent: View) {
            this.stars = new PIXI.TilingSprite(Resources.getObject("backgroundLayer1"), 600, 600);
            this.stars.alpha = 0;
            parent.addChild(this.stars);
        }
        set opacity(alpha: number) {
            this.stars.alpha = alpha;
        }
        get opacity(): number {
            return this.stars.alpha;
        }
        move(vec: IVector) {
            this.stars.tilePosition.x -= vec.x;
            this.stars.tilePosition.y -= vec.y;
        }
    }
} 