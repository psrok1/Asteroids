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
            this.activeSubview.resume();
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
    }

    class MissionSubview extends Subview {
        private blinkPhase: number = 0;

        constructor(parent: MainView) {
            super(parent);

            var missionNumber = new PIXI.Text("FIRST MISSION", {
                font: "24px JacintoSans",
                fill: "white"
            });
            missionNumber.anchor.x = 0.5;
            missionNumber.position = new PIXI.Point(300, 160);
            this.registerObject("missionNumber", missionNumber);

            var missionName = new PIXI.Text("NEWBIE", {
                font: "32px JacintoSans",
                fill: "white"
            });
            missionName.anchor.x = 0.5;
            missionName.position = new PIXI.Point(300, 200);
            this.registerObject("missionName", missionName);

            var missionTitle = new PIXI.Text("this game is too easy to lose", {
                font: "24px JacintoSans",
                fill: "white"
            });
            missionTitle.anchor.x = 0.5;
            missionTitle.position = new PIXI.Point(300, 232);
            this.registerObject("missionTitle", missionTitle);

            var missionDescription = new PIXI.Text("very very long description....", {
                font: "16px Digital-7",
                fill: "white",
                wordWrap: true,
                wordWrapWidth: 536
            });
            var debugDesc = "";
            for (var i = 0; i < 6; i++)
                debugDesc += "very long endless description for debugging purpose... ";
            missionDescription.position = new PIXI.Point(32, 300);
            missionDescription.setText(debugDesc);
            this.registerObject("missionDescription", missionDescription);

            var missionStart = new PIXI.Text("START GAME", {
                font: "32px Digital-7",
                fill: "white"
            });
            missionStart.anchor.x = 0.5;
            missionStart.position = new PIXI.Point(300, 332 + missionDescription.height);
            missionStart.touchstart = missionStart.mousedown = parent.startMission.bind(parent);
            this.registerObject("missionStart", missionStart);
            this.pause();
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

        constructor(parent: MainView) {
            super(parent);
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