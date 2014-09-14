module Layout {
    export class EquipmentSubview extends Subview {
        private leftSlot: EquipmentSubviewSlot;
        private rightSlot: EquipmentSubviewSlot;

        private leftLoad: PIXI.Text;
        private rightLoad: PIXI.Text;

        private notAvailLabel: PIXI.Text;

        private selectedType: number = null;
        private blinkClock: number = 0;

        constructor(parent: MainView) {
            super(parent);
            var leftSlotLabel = new PIXI.Text("LEFT", {
                font: "24px JacintoSans",
                fill: "white"
            });
            var rightSlotLabel = new PIXI.Text("RIGHT", {
                font: "24px JacintoSans",
                fill: "white"
            });
            leftSlotLabel.position = new PIXI.Point(32, 128);
            rightSlotLabel.position = new PIXI.Point(476, 128);
            this.registerObject("leftSlotLabel", leftSlotLabel);
            this.registerObject("rightSlotLabel", rightSlotLabel);

            this.leftSlot = new EquipmentSubviewSlot();
            this.leftSlot.position = new PIXI.Point(36, 176);
            this.rightSlot = new EquipmentSubviewSlot();
            this.rightSlot.position = new PIXI.Point(492, 176);

            this.registerObject("leftSlot", this.leftSlot);
            this.registerObject("rightSlot", this.rightSlot);

            this.leftLoad = new PIXI.Text("LOAD", {
                font: "24px Digital-7",
                fill: "white"
            });
            this.leftLoad.position = new PIXI.Point(44, 256);
            this.leftLoad.interactive = this.leftLoad.buttonMode = true;
            this.leftLoad.mousedown = this.leftLoad.touchstart = this.loadSlot.bind(this, 0);
            this.rightLoad = new PIXI.Text("LOAD", {
                font: "24px Digital-7",
                fill: "white"
            });
            this.rightLoad.position = new PIXI.Point(504, 256);
            this.rightLoad.interactive = this.rightLoad.buttonMode = true;
            this.rightLoad.mousedown = this.rightLoad.touchstart = this.loadSlot.bind(this, 1);

            this.registerObject("leftLoad", this.leftLoad);
            this.registerObject("rightLoad", this.rightLoad);

            var descLabel = new PIXI.Text("CHOOSE ROCKET TYPE AND LOAD INTO SLOT", {
                font: "12px Digital-7",
                fill: "white"
            });
            descLabel.anchor = new PIXI.Point(0.5, 0);
            descLabel.position = new PIXI.Point(300, 176);
            this.registerObject("description", descLabel);

            this.notAvailLabel = new PIXI.Text("NOT AVAILABLE", {
                font: "32px Digital-7",
                fill: "gray"
            });
            this.notAvailLabel.anchor = new PIXI.Point(0.5, 0);
            this.notAvailLabel.position = new PIXI.Point(300, 220);
            this.registerObject("notAvailableMessage", this.notAvailLabel);

            for (var i = 0; i <= 5; i++)
                this.registerObject("rocketButton" + i, this.drawRocketButton(i));
            this.unselectType();
            this.pause();
        }

        drawRocketButton(rocket: number, checked: boolean = false): PIXI.Graphics {
            var rocketNames = ["Standard rocket", "Explosive rocket", "Engine breaker",
                "Gun silencer", "Flashbang", "Gravity rocket"];
            var box = new PIXI.Graphics();
            box.beginFill(0x202020, (checked ? 1 : 0.5));
            box.lineStyle(1, 0x202020, 1);
            box.drawRect(0, 0, 192, 48);
            box.endFill();
            box.position = new PIXI.Point(204, 192 + rocket * 48);

            var rocketThumb = new PIXI.Sprite(Resources.getObject("rocket1" + rocket));
            rocketThumb.anchor = new PIXI.Point(0.5, 0.5);
            rocketThumb.scale = new PIXI.Point(0.5, 0.5);
            rocketThumb.rotation = Math.PI;
            rocketThumb.position = new PIXI.Point(32, 24);
            box.addChild(rocketThumb);

            var rocketLabel = new PIXI.Text(rocketNames[rocket], {
                font: "12px monospace",
                fill: "white"
            });
            rocketLabel.anchor = new PIXI.Point(0, 0.5);
            rocketLabel.position = new PIXI.Point(64, 24);
            box.addChild(rocketLabel);
            box.interactive = true;
            box.buttonMode = true;
            box.mousedown = box.touchstart = this.selectType.bind(this, rocket);
            return box;
        }

        highlightLoadButtons(enable: boolean) {
            var style = {
                font: "24px Digital-7",
                fill: (enable ? "white" : "gray")
            };
            this.leftLoad.setStyle(style);
            this.rightLoad.setStyle(style);
            this.leftLoad.alpha = this.rightLoad.alpha = 1;
        }

        selectType(id: number) {
            if (this.selectedType !== null)
                this.setObject("rocketButton" + this.selectedType, this.drawRocketButton(this.selectedType));
            this.setObject("rocketButton" + id, this.drawRocketButton(id, true));
            this.selectedType = id;
            this.highlightLoadButtons(true);
        }

        unselectType() {
            if (this.selectedType !== null)
                this.setObject("rocketButton" + this.selectedType, this.drawRocketButton(this.selectedType));
            this.selectedType = null;
            this.highlightLoadButtons(false);
        }

        update() {
            if (this.selectedType !== null)
                this.leftLoad.alpha = this.rightLoad.alpha = ((this.blinkClock++ % 40) > 20 ? 1 : 0);
        }

        loadSlot(which: number) {
            if (this.selectedType !== null) {
                Player.loadRocketSlot(which, this.selectedType);
                this.updateSlots();
            }
        }

        updateSlots() {
            this.leftSlot.getPlayerSlot(0);
            this.rightSlot.getPlayerSlot(1);
        }

        updateAvailableTypes() {
            for (var i = 0; i <= 5; i++)
                this.removeObject("rocketButton" + i, false);
            var skillLevel = Player.rocketSkillLevel();
            for (var i = 0; i < skillLevel * 2; i++)
                this.registerObject("rocketButton" + i, this.drawRocketButton(i));
            this.notAvailLabel.visible = (skillLevel === 0);
            this.unselectType();
        }

        resume() {
            super.resume();
            this.updateSlots();
            this.updateAvailableTypes();
        }
    }

    class EquipmentSubviewSlot extends PIXI.Graphics {
        private rocketSprite: PIXI.Sprite;
        private noRocket: PIXI.Text;
        private amountLabel: PIXI.Text;

        constructor() {
            super();
            super.beginFill(0x202020, 1);
            super.lineStyle(1, 0x404040, 1);
            super.drawRect(0, 0, 64, 64);
            super.endFill();

            this.rocketSprite = new PIXI.Sprite(Resources.getObject("rocket10"));
            this.rocketSprite.rotation = Math.PI;
            this.rocketSprite.anchor = new PIXI.Point(0.5, 0.5);
            this.rocketSprite.position = new PIXI.Point(32, 32);
            this.rocketSprite.visible = false;
            super.addChild(this.rocketSprite);

            this.noRocket = new PIXI.Text("X", {
                font: "24px monospace",
                fill: "white"
            });
            this.noRocket.anchor = new PIXI.Point(0.5, 0.5);
            this.noRocket.position = new PIXI.Point(32, 32);
            super.addChild(this.noRocket);

            this.amountLabel = new PIXI.Text("3X", {
                font: "12px Digital-7",
                fill: "white"
            });
            this.amountLabel.position = new PIXI.Point(52, 52);
            super.addChild(this.amountLabel);
        }

        getPlayerSlot(which: number) {
            var slot = Player.getRocketSlot(which);
            if (slot.type === -1) {
                this.noRocket.visible = true;
                this.amountLabel.visible = false;
                this.rocketSprite.visible = false;
            } else {
                this.noRocket.visible = false;
                this.amountLabel.visible = this.rocketSprite.visible = true;
                this.rocketSprite.setTexture(Resources.getObject("rocket1" + slot.type));
                this.amountLabel.setText(slot.amount + "X");
            }
        }
    }
} 