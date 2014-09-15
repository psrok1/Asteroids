module Layout {
    export class SkillsSubview extends Subview {
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
            for (var i = 0; i < 3; i++)
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
            skillSprite.mouseover = function (e: PIXI.InteractionData) {
                var _this: SkillsSubview = this._this;
                var position: PIXI.Point = e.getLocalPosition(_this.parentView).clone();
                if (position.x > 500)
                    position.x = 500;
                _this.skillInfobox.show(position, this.whichSkill);
            }.bind({
                    _this: this,
                    whichSkill: id - 1
                });
            skillSprite.mouseout = function () {
                var _this: SkillsSubview = this._this;
                _this.skillInfobox.hide(this.whichSkill);
            }.bind({
                    _this: this,
                    whichSkill: id - 1
                });
            skillSprite.mousedown = skillSprite.touchstart = function () {
                var _this: SkillsSubview = this._this;
                Player.increaseSkillLevel(this.whichSkill);
                _this.skillInfobox.update();
                _this.parentView.updatePlayerData();
                for (var i = 1; i <= 16; i++)
                    _this.updateSkill(i);
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
                this.skillRequirements[i].position = new PIXI.Point(16, 134 + 16 * i);
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
            return (skillReq.length == 0 ? 0 : lastReq + 1);
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
        }
        show(position: PIXI.Point, whichSkill: number) {
            this.box.position = position.clone();
            this.updateSkillInformation(whichSkill);
            this.box.visible = true;
            this.showed = true;
            this.currentSkill = whichSkill;
        }
        update() {
            if (!this.showed)
                return;
            this.updateSkillInformation(this.currentSkill);
        }
        hide(whichSkill: number) {
            if (this.showed && this.currentSkill == whichSkill) {
                this.box.visible = false;
                this.showed = false;
            }
        }
    }
}  