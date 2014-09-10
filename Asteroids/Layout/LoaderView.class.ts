module Layout {
    export class LoaderView extends View {
        private progressBar: PIXI.Graphics;
        private progressText: PIXI.Text;

        constructor() {
            super();
            var logoTexture: PIXI.Texture = PIXI.Texture.fromImage("Sprites/logo.png");
            var logoSprite: PIXI.Sprite = new PIXI.Sprite(logoTexture);
            logoSprite.position.x = 68;
            logoSprite.position.y = 200;
            this.addChild(logoSprite);

            this.progressBar = new PIXI.Graphics();
            this.progressBar.lineStyle(1, 0x303030);
            this.progressBar.drawRect(68, 400, 464, 8);
            this.progressBar.position.x = this.progressBar.position.y = 0;
            this.addChild(this.progressBar);

            this.progressText = new PIXI.Text("Loading resources", { font: "12px monospace", fill: "gray" });
            this.progressText.position.x = 300;
            this.progressText.position.y = 380;
            this.progressText.anchor.x = this.progressText.anchor.y = 0.5;
            this.addChild(this.progressText);
        }
        setProgress(progress: number, progressMax: number) {
            if (progress == 0)
                return;
            this.progressBar.beginFill(0x303030, 1);
            this.progressBar.drawRect(68, 400, 464 * progress / progressMax, 8);
        }
        setStatusText(text: string) {
            this.progressText.setText(text);
        }
    }
} 