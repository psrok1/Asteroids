﻿module Layout {
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

    class Subview {
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
        setObject(name: string, obj: PIXI.DisplayObject) {
            if (!this.layoutObjects[name])
                throw new Error("Error: Reference to subview object " + name + " which doesn't exist");
            this.parentView.removeChild(this.layoutObjects[name]);
            this.layoutObjects[name] = obj;
            this.parentView.addChild(obj);
        }
        removeObject(name: string) {
            if (!this.layoutObjects[name])
                throw new Error("Error: Reference to subview object " + name + " which doesn't exist");
            this.parentView.removeChild(this.layoutObjects[name]);
            delete this.layoutObjects[name];
        }
    }

    class MissionSubview extends Subview {
        private blinkPhase: number = 0;
        private missionNumber: PIXI.Text;
        private missionName: PIXI.Text;
        private missionTitle: PIXI.Text;
        private missionDescription: PIXI.Text;
        private missionStart: PIXI.Text;

        constructor(parent: MainView) {
            super(parent);

            this.missionNumber = new PIXI.Text("FIRST MISSION", {
                font: "24px JacintoSans",
                fill: "white"
            });
            this.missionNumber.anchor.x = 0.5;
            this.missionNumber.position = new PIXI.Point(300, 160);
            this.registerObject("missionNumber", this.missionNumber);

            this.missionName = new PIXI.Text("NEWBIE", {
                font: "32px JacintoSans",
                fill: "white"
            });
            this.missionName.anchor.x = 0.5;
            this.missionName.position = new PIXI.Point(300, 200);
            this.registerObject("missionName", this.missionName);

            this.missionTitle = new PIXI.Text("this game is too easy to lose", {
                font: "24px JacintoSans",
                fill: "white"
            });
            this.missionTitle.anchor.x = 0.5;
            this.missionTitle.position = new PIXI.Point(300, 232);
            this.registerObject("missionTitle", this.missionTitle);

            this.missionDescription = new PIXI.Text("very very long description....", {
                font: "16px Digital-7",
                fill: "white",
                wordWrap: true,
                wordWrapWidth: 536
            });
            // DEBUG
            var debugDesc = "";
            for (var i = 0; i < 6; i++)
                debugDesc += "very long endless description for debugging purpose... ";
            this.missionDescription.position = new PIXI.Point(32, 300);
            this.missionDescription.setText(debugDesc);
            this.registerObject("missionDescription", this.missionDescription);

            this.missionStart = new PIXI.Text("START GAME", {
                font: "32px Digital-7",
                fill: "white"
            });
            this.missionStart.anchor.x = 0.5;
            this.missionStart.position = new PIXI.Point(300, 420);
            this.missionStart.touchstart = this.missionStart.mousedown = parent.startMission.bind(parent);
            this.registerObject("missionStart", this.missionStart);
            this.pause();
        }

        setMissionDescription(mission: Mission) {
            this.missionNumber.setText(mission.numberDescription);
            this.missionName.setText(mission.majorTitle);
            this.missionTitle.setText(mission.minorTitle);
            this.missionDescription.setText(mission.description);
        }

        update() {
            if (this.blinkPhase++ == 20) {
                var missionStart = this.getObject("missionStart");
                this.blinkPhase = 0;
                missionStart.visible = !missionStart.visible;
            }
        }
        resume() {
            super.resume();
            this.blinkPhase = 0;
            this.getObject("missionStart").visible = true;
            this.setMissionDescription(Player.getCurrentMission());
        }
    }

    class SkillsSubview extends Subview {
        private skillSprites: PIXI.Sprite[] = new Array();
        private skillInfobox: SkillInfobox;

        constructor(parent: MainView) {
            super(parent);
            for (var i = 1; i <= 16; i++)
                this.drawSkill(i);
            var offensiveLabel = new PIXI.Text("offensive", {
                font: "32px JacintoSans",
                fill: "white"
            });
            var defensiveLabel = new PIXI.Text("defensive", {
                font: "32px JacintoSans",
                fill: "white"
            });
            offensiveLabel.position = new PIXI.Point(32, 160);
            defensiveLabel.position = new PIXI.Point(32, 280);
            this.registerObject("offensiveLabel", offensiveLabel);
            this.registerObject("defensiveLabel", defensiveLabel);
            this.skillInfobox = new SkillInfobox(parent);
            this.pause();
        }

        private updateSkill(id: number) {
            var skillSprite = <PIXI.Sprite>this.getObject("skill" + id);
            var skillLevel = Player.getSkillLevel(id - 1);
            skillSprite.setTexture(Resources.getObject("skill" + id + (skillLevel > 0 ? "1" : "0")));
            for(var i = 0; i < 3; i++)
                skillSprite.children[i].visible = (skillLevel > i);
        }

        private drawSkill(id: number) {
            var skillSprite = new PIXI.Sprite(Resources.getObject("skill" + id + "0"));
            var createStar = (which: number): PIXI.Sprite => {
                var star = new PIXI.Sprite(Resources.getObject("skillStar"));
                star.position = new PIXI.Point(36 - (12 * which), 46);
                star.visible = false;
                return star;
            };
            for (var i = 0; i < 3; i++)
                skillSprite.addChild(createStar(i));
            skillSprite.position = new PIXI.Point(32 + ((id - 1) % 8) * 67, 200 + Math.floor((id - 1) / 8) * 120);
            skillSprite.mouseover = function(e: PIXI.InteractionData) {
                var _this: SkillsSubview = this._this;
                var position: PIXI.Point = e.getLocalPosition(_this.parentView).clone();
                if (position.x > 500)
                    position.x = 500;
                _this.skillInfobox.show(position, this.whichSkill);
            }.bind({
                _this: this,
                whichSkill: id - 1
                });
            skillSprite.mouseout = function() {
                var _this: SkillsSubview = this._this;
                _this.skillInfobox.hide(this.whichSkill);
            }.bind({
                _this: this,
                whichSkill: id - 1
                });
            this.registerObject("skill" + id, skillSprite);
        }

        resume() {
            super.resume();
            for (var i = 1; i <= 16; i++)
                this.updateSkill(i);
        }
    }

    class EquipmentSubview extends Subview {
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

            for(var i = 0; i <= 5; i++)
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
                this.removeObject("rocketButton" + i);
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

    class SkillInfobox {
        private parent: MainView;
        private box: PIXI.Graphics;
        private showed: boolean = false;
        private currentSkill: number = 0;

        private skillName: PIXI.Text;
        private currentLevel: PIXI.Text;
        private currentDescription: PIXI.Text;
        private nextLevel: PIXI.Text;
        private nextUpgradeInfo: PIXI.Text;
        private nextDescription: PIXI.Text;

        private requirementsLabel: PIXI.Text;

        private crystalRequirements: PIXI.Text[] = new Array();
        private crystalSprites: PIXI.Sprite[] = new Array();

        private skillRequirements: PIXI.Text[] = new Array();

        constructor(parent: MainView) {
            this.parent = parent;

            this.box = new PIXI.Graphics();
            this.redrawBox(180, 200);

            this.skillName = new PIXI.Text("SKILL NAME", {
                font: "bold 12px monospace",
                fill: "white"
            });
            this.skillName.position = new PIXI.Point(90, 16);
            this.skillName.anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.skillName);

            this.currentLevel = new PIXI.Text("Level 1", {
                font: "bold 10px monospace",
                fill: "yellow"
            });
            this.currentLevel.position = new PIXI.Point(90, 32);
            this.currentLevel.anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.currentLevel);

            this.currentDescription = new PIXI.Text("Shield +5%", {
                font: "10px monospace",
                fill: "white"
            });
            this.currentDescription.position = new PIXI.Point(16, 48);
            this.currentDescription.anchor = new PIXI.Point(0, 0.5);
            this.box.addChild(this.currentDescription);

            this.nextLevel = new PIXI.Text("Level 2", {
                font: "bold 10px monospace",
                fill: "lime"
            });
            this.nextLevel.position = new PIXI.Point(90, 64);
            this.nextLevel.anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.nextLevel);

            this.nextUpgradeInfo = new PIXI.Text("CLICK TO UPGRADE", {
                font: "8px monospace",
                fill: "lime"
            });
            this.nextUpgradeInfo.position = new PIXI.Point(90, 76);
            this.nextUpgradeInfo.anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.nextUpgradeInfo);

            this.nextDescription = new PIXI.Text("Shield +10%", {
                font: "10px monospace",
                fill: "white"
            });
            this.nextDescription.position = new PIXI.Point(16, 90);
            this.nextDescription.anchor = new PIXI.Point(0, 0.5);
            this.box.addChild(this.nextDescription);

            this.requirementsLabel = new PIXI.Text("REQUIREMENTS", {
                font: "8px monospace",
                fill: "white"
            });
            this.requirementsLabel.position = new PIXI.Point(90, 106);
            this.requirementsLabel.anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.requirementsLabel);

            this.crystalSprites[0] = new PIXI.Sprite(Resources.getObject("crystal12"));
            this.crystalSprites[0].position = new PIXI.Point(24, 120);
            this.crystalSprites[0].anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.crystalSprites[0]);

            this.crystalRequirements[0] = new PIXI.Text("00000", {
                font: "12px Digital-7",
                fill: "#FFB6B8"
            });
            this.crystalRequirements[0].position = new PIXI.Point(55, 118);
            this.crystalRequirements[0].anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.crystalRequirements[0]);

            this.crystalSprites[1] = new PIXI.Sprite(Resources.getObject("crystal32"));
            this.crystalSprites[1].position = new PIXI.Point(90, 120);
            this.crystalSprites[1].anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.crystalSprites[1]);

            this.crystalRequirements[1] = new PIXI.Text("00000", {
                font: "12px Digital-7",
                fill: "#FBFFA7"
            });
            this.crystalRequirements[1].position = new PIXI.Point(120, 118);
            this.crystalRequirements[1].anchor = new PIXI.Point(0.5, 0.5);
            this.box.addChild(this.crystalRequirements[1]);

            for (var i = 0; i < 3; i++) {
                this.skillRequirements[i] = new PIXI.Text("Skill (level 1)", {
                    font: "10px monospace",
                    fill: "white"
                });
                this.skillRequirements[i].position = new PIXI.Point(16, 134+16*i);
                this.skillRequirements[i].anchor = new PIXI.Point(0, 0.5);
                this.box.addChild(this.skillRequirements[i]);
            }
            this.box.visible = false;
            this.parent.addChild(this.box);
        }
        private hideCurrentSkillLevel() {
            this.currentDescription.visible = false;
            this.currentLevel.visible = false;
            this.nextLevel.position.y = 32;
            this.nextUpgradeInfo.position.y = 44;
            this.nextDescription.position.y = 58;
            this.requirementsLabel.position.y = 74;
            for (var i = 0; i < 2; i++) {
                this.crystalSprites[i].position.y = 88;
                this.crystalRequirements[i].position.y = 86;
            }
            for (var i = 0; i < 3; i++)
                this.skillRequirements[i].position.y = 102 + i * 16;
        }
        private showCurrentSkillLevel() {
            this.currentDescription.visible = true;
            this.currentLevel.visible = true;
            this.nextLevel.position.y = 64;
            this.nextUpgradeInfo.position.y = 76;
            this.nextDescription.position.y = 90;
            this.requirementsLabel.position.y = 106;
            for (var i = 0; i < 2; i++) {
                this.crystalSprites[i].position.y = 120;
                this.crystalRequirements[i].position.y = 118;
            }
            for (var i = 0; i < 3; i++)
                this.skillRequirements[i].position.y = 134 + i * 16;
        }
        private hideUpgradeRequirements() {
            this.nextUpgradeInfo.visible = this.nextDescription.visible = false;
            this.requirementsLabel.visible = false;
            for (var i = 0; i < 2; i++)
                this.crystalSprites[i].visible = this.crystalRequirements[i].visible = false;
            for (var i = 0; i < 3; i++)
                this.skillRequirements[i].visible = false;
        }
        private showUpgradeRequirements() {
            this.nextUpgradeInfo.visible = this.nextDescription.visible = true;
            this.requirementsLabel.visible = true;
            for (var i = 0; i < 2; i++)
                this.crystalSprites[i].visible = this.crystalRequirements[i].visible = true;
            for (var i = 0; i < 3; i++)
                this.skillRequirements[i].visible = true;
        }
        private redrawBox(width: number, height: number) {
            // TODO: Apply view scale
            this.box.clear();
            this.box.beginFill(0x202020, 0.6);
            this.box.lineStyle(1, 0x606060, 1);
            this.box.drawRect(0, 0, width, height);
            this.box.endFill();
        }
        private updateCrystalRequirements(req: SkillCrystalRequirements) {
            var type: number[] = [1, 2];
            var color: string[] = ["", ""];
            var value: number[] = [0, 0];
            var which: number = 0;
            for (var item in req)
                if (req[item] > 0) {
                    switch (item) {
                        case "red":
                            type[which] = 1;
                            color[which] = "#FFB6B8";
                            break;
                        case "green":
                            type[which] = 2;
                            color[which] = "#BFFCC3";
                            break;
                        case "yellow":
                            type[which] = 3;
                            color[which] = "#FBFFA7";
                            break;
                        case "blue":
                            type[which] = 4;
                            color[which] = "#B3FCFC";
                            break;
                    }
                    value[which] = req[item];
                    which++;
                }
            for (var i = 0; i < 2; i++) {
                this.crystalSprites[i].setTexture(Resources.getObject("crystal" + type[i] + "2"));
                this.crystalRequirements[i].setText(value[i].toString());
                this.crystalRequirements[i].setStyle({
                    font: "12px Digital-7",
                    fill: color[i]
                });
            }
        }
        private updateSkillRequirements(skillReq: SkillRequirements[]): number {
            var i = 0, lastReq = 0;
            for (; i < skillReq.length && i < 3; i++)
                this.skillRequirements[i].setText(skillReq[i].skill + " (Level " + skillReq[i].requiredLevel + " )");
            lastReq = i;
            for (; i < 3; i++)
                this.skillRequirements[i].visible = false;
            return (skillReq.length == 0 ? 0 : lastReq+1);
        }
        private updateSkillInformation(which: number) {
            var skillInformation: SkillData = <SkillData>(Resources.getObject("skillsData").skills[which]);
            this.skillName.setText(skillInformation.name);
            var currentSkillLevel: number = Player.getSkillLevel(which);
            var nextSkillLevel: number = currentSkillLevel + 1;
            var currentSkillLevelInformation: SkillLevelInformation =
                (currentSkillLevel > 0 ? skillInformation.levelData[currentSkillLevel - 1] : undefined);
            var nextSkillLevelInformation: SkillLevelInformation =
                (nextSkillLevel < 4 ? skillInformation.levelData[nextSkillLevel - 1] : undefined);
            if (currentSkillLevel == 0)
                this.hideCurrentSkillLevel();
            else {
                this.showCurrentSkillLevel();
                this.currentLevel.setText("Level " + currentSkillLevel);
                this.currentDescription.setText(currentSkillLevelInformation.description);
            }
            if (currentSkillLevel == 3) {
                this.nextLevel.setText("Maximum level reached");
                this.hideUpgradeRequirements();
                this.redrawBox(180, this.nextLevel.position.y + 16);
            } else {
                this.showUpgradeRequirements();
                this.nextLevel.setText("Level " + nextSkillLevel);
                this.nextDescription.setText(nextSkillLevelInformation.description);
                this.updateCrystalRequirements(nextSkillLevelInformation.cost);
                var lastReq = this.updateSkillRequirements(nextSkillLevelInformation.skillRequirements);
                this.redrawBox(180, this.crystalSprites[0].position.y + 16 * lastReq + 16);
                if (Player.checkSkillRequirements(which)) {
                    this.nextUpgradeInfo.visible = true;
                    this.nextLevel.setStyle({
                        font: "bold 10px monospace",
                        fill: "lime"
                    });
                } else {
                    this.nextUpgradeInfo.visible = false;
                    this.nextLevel.setStyle({
                        font: "bold 10px monospace",
                        fill: "gray"
                    });
                }
            }
            // check requirements
        }
        show(position: PIXI.Point, whichSkill: number) {
            this.box.position = position.clone();
            this.updateSkillInformation(whichSkill);
            this.box.visible = true;
            this.showed = true;
            this.currentSkill = whichSkill;
        }
        hide(whichSkill:number) {
            if (this.showed && this.currentSkill == whichSkill) {
                this.box.visible = false;
                this.showed = false;
            }
        }
    }
}