module Layout {
    export class MissionSubview extends Subview {
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
}  