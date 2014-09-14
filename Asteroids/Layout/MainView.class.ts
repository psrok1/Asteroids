module Layout {
    export class MainView extends View {
        private sky: Stars;
        private subviews: Subview[] = new Array();
        private activeSubview: Subview;
        private subviewButtons: PIXI.Text[] = new Array();

        private nameField: PIXI.Text;
        private crystalAmountField: PIXI.Text[] = new Array();

        constructor() {
            super();
            this.sky = new Stars(this);
            this.drawShipIcon();
            this.drawPlayerData();
            this.drawMenu();
            this.subviews["mission"] = new MissionSubview(this);
            this.subviews["skills"] = new SkillsSubview(this);
            this.subviews["equipment"] = new EquipmentSubview(this);
            this.activeSubview = this.subviews["mission"];
        }

        startMission() {
            ViewManager.getInstance().switchView("game");
        }

        onKeyDown(event: KeyboardEvent) {
            var key: number = (event.which == null ? event.keyCode : event.which);
            if (key == Keyboard.Key.Tab)
                this.switchSubview((this.activeSubviewId() + 1) % 3);
            if (this.activeSubview == this.subviews["mission"]) {
                if (key == Keyboard.Key.Space)
                    this.startMission();
            }
        }
        updatePlayerData() {
            this.nameField.setText(Player.getName());
            for (var i = 0; i < 4; i++)
                this.crystalAmountField[i].setText(Player.getCrystalAmount(i).toString());
        }
        private activeSubviewId(): number {
            if (this.activeSubview == this.subviews["mission"])
                return 0;
            else if (this.activeSubview == this.subviews["skills"])
                return 1;
            else if (this.activeSubview == this.subviews["equipment"])
                return 2;
            else
                return -1;
        }      
        private switchSubview(which: number) {
            var enabledStyle = {
                font: "16px JacintoSans",
                fill: "white"
            };
            var disabledStyle = {
                font: "16px JacintoSans",
                fill: "gray"
            };
            for (var i = 0; i < 3; i++)
                this.subviewButtons[i].setStyle(i == which ? enabledStyle : disabledStyle);
            if (this.activeSubview)
                this.activeSubview.pause();
            switch (which) {
                case 0:
                    this.activeSubview = this.subviews["mission"];
                    break;
                case 1:
                    this.activeSubview = this.subviews["skills"];
                    break;
                case 2:
                    this.activeSubview = this.subviews["equipment"];
                    break;
            }
            this.activeSubview.resume();
        }
        private drawShipIcon() {
            var icon = new PIXI.Graphics();
            var ship = new PIXI.Sprite(Resources.getObject("ship3"));
            icon.lineStyle(1, 0x2F2F2F, 0.5);
            icon.beginFill(0x101010, 0.3);
            icon.drawRect(0, 0, 64, 64);
            icon.endFill();
            ship.scale = new PIXI.Point(0.75, 0.75);
            icon.position = new PIXI.Point(32, 32);
            ship.position = new PIXI.Point(32, 32);
            ship.anchor = new PIXI.Point(0.5, 0.5);
            icon.addChild(ship);
            this.addChild(icon);
        }
        private drawPlayerData() {
            var name = new PIXI.Text("PAS", {
                font: "32px Digital-7",
                fill: "white"                
            });
            name.position.x = 110;
            name.position.y = 32;
            this.nameField = name;
            this.addChild(name);
            for(var i = 0; i < 4; i++)
                this.drawCrystalAmount(i+1, { x: 260+80*i, y: 40 });
        }
        private drawCrystalAmount(which: number, position: IPoint) {
            var crystalSprite = new PIXI.Sprite(Resources.getObject("crystal" + which + "4"));
            var fillColor: string;
            switch (which) {
                case 1:
                    fillColor = "#FFB6B8";
                    break;
                case 2:
                    fillColor = "#BFFCC3";
                    break;
                case 3:
                    fillColor = "#FBFFA7";
                    break;
                case 4:
                    fillColor = "#B3FCFC";
                    break;
            }
            var textAmount = new PIXI.Text("00000", {
                font: "16px Digital-7",
                fill: fillColor
            });
            this.crystalAmountField[which-1] = textAmount;
            textAmount.setText("00000");
            crystalSprite.position.x = position.x; 
            textAmount.anchor.x = 0.5;           
            textAmount.position.x = position.x + 50;
            crystalSprite.position.y = textAmount.position.y = position.y;
            this.addChild(crystalSprite);
            this.addChild(textAmount);
        }
        private drawMenu() {
            var missionSection = new PIXI.Text("MISSION", {
                font: "16px JacintoSans",
                fill: "white"});
            missionSection.position = new PIXI.Point(260, 64);
            missionSection.interactive = true;
            missionSection.touchstart = missionSection.mousedown = this.switchSubview.bind(this, 0);
            this.addChild(missionSection);
            var skillsSection = new PIXI.Text("SKILLS", {
                font: "16px JacintoSans",
                fill: "gray"
            });
            skillsSection.position = new PIXI.Point(368, 64);
            skillsSection.interactive = true;
            skillsSection.touchstart = skillsSection.mousedown = this.switchSubview.bind(this, 1);
            this.addChild(skillsSection);
            var equipmentSection = new PIXI.Text("EQUIPMENT", {
                font: "16px JacintoSans",
                fill: "gray"
            });
            equipmentSection.position = new PIXI.Point(460, 64);
            equipmentSection.interactive = true;
            equipmentSection.touchstart = equipmentSection.mousedown = this.switchSubview.bind(this, 2);
            this.addChild(equipmentSection);
            this.subviewButtons[0] = missionSection;
            this.subviewButtons[1] = skillsSection;
            this.subviewButtons[2] = equipmentSection;
        }
        update() {
            this.sky.move({ x: -1, y: -1 });
            if(this.activeSubview)
                this.activeSubview.update();
        }
        resume() {
            super.resume();
            this.updatePlayerData();
            this.activeSubview.resume();
        }

        pause() {
            super.pause();
            this.activeSubview.pause();
        }
    }

    class Stars {
        private stars: PIXI.TilingSprite;

        constructor(parent: View) {
            this.stars = new PIXI.TilingSprite(Resources.getObject("backgroundLayer1"), 600, 600);
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

    export class Subview {
        parentView: MainView;
        private layoutObjects: PIXI.DisplayObject[] = new Array();

        constructor(parent: MainView) {
            this.parentView = parent;
        }
        pause() {
            for (var objectId in this.layoutObjects) {
                var obj = this.layoutObjects[objectId];
                obj.visible = obj.interactive = false;
            }
        }
        resume() {
            for (var objectId in this.layoutObjects) {
                var obj = this.layoutObjects[objectId];
                obj.visible = obj.interactive = true;
            }
        }
        update() { }
        registerObject(name: string, obj: PIXI.DisplayObject) {
            if (this.layoutObjects[name])
                throw new Error("Error: Subview object "+name+" is duplicated");
            this.layoutObjects[name] = obj;
            this.parentView.addChild(obj);
        }
        getObject(name: string): PIXI.DisplayObject {
            if (!this.layoutObjects[name])
                throw new Error("Error: Reference to subview object " + name + " which doesn't exist");
            return this.layoutObjects[name];
        }
        setObject(name: string, obj: PIXI.DisplayObject, strict: boolean = true) {
            if (!this.layoutObjects[name])
                throw new Error("Error: Reference to subview object " + name + " which doesn't exist");
            this.parentView.removeChild(this.layoutObjects[name]);
            this.layoutObjects[name] = obj;
            this.parentView.addChild(obj);
        }
        removeObject(name: string, strict: boolean = true) {
            if (!this.layoutObjects[name])
                if (strict)
                    throw new Error("Error: Reference to subview object " + name + " which doesn't exist");
                else
                    return;
            this.parentView.removeChild(this.layoutObjects[name]);
            delete this.layoutObjects[name];
        }
    }
}