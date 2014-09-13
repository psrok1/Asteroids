module Objects {
    export class World {
        view: Layout.GameView;
        objects: GameObject[] = new Array();
        CPUobjects: CPUShip[] = new Array();
        width: number;
        height: number;
        player: PlayerShip;
        private introPhase: boolean;
        private mission: Mission;

        private paused: boolean = true;

        constructor(view: Layout.GameView, mission: Mission) {
            this.mission = mission;
            this.width  = this.mission.width;
            this.height = this.mission.height;
            this.view = view;
            for (var object in this.mission.objects)
                this.createObject(this.mission.objects[object]);
            this.startIntroPhase();
            this.resume();
        }

        createObject(object: MissionObject): GameObject {
            var position: Point = new Point(object.position.x, object.position.y);
            var velocity: Vector = new Vector(object.velocity.x, object.velocity.y);
            var gameObject: GameObject = null;
            switch (object.model) {
                // DEBUG: hard-coded types
                case "asteroid":
                    gameObject = new Asteroid(this, 10, position, velocity);
                    break;
                case "ship":
                    gameObject = new SoldierShip(this, position, velocity);
                    break;
                default:
                    throw new Error("Error: World.createObject failed. Unknown model of object '" + object.model + "'");
            }
            if (gameObject && object.objectName)
                gameObject.name = object.objectName;
            return gameObject;
        }

        getObjectByName(name: string) {
            for (var index in this.objects)
                if (this.objects[index].name && this.objects[index].name == name)
                    return this.objects[index];
            return null;
        }

        destroyObject(object: GameObject) {
            object.onDestroy();
            this.objects.splice(this.objects.indexOf(object), 1);
        }

        nearestOnTheRay(rayStart: Point, rayVector: Vector): GameObject {
            var nearestObject: GameObject = null;
            var nearestLength: number = null;
            for (var index in this.objects) {
                var object: GameObject = this.objects[index];
                if (rayIntersectsObject(rayStart, rayVector, object.getPosition(), object.getRadius())) {
                    var posVector: Vector = object.getPosition().getRelative(rayStart).getPositionVector();
                    if (nearestLength == null || nearestLength > posVector.length) {
                        nearestLength = posVector.length;
                        nearestObject = object;
                    }
                }
            }
            return nearestObject;
        }

        pause() {
            this.paused = true;
        }

        resume() {
            this.paused = false;
        }
        isPaused(): boolean { return this.paused; }

        update() {
            if (this.paused)
                return;
            // update objects state
            for (var object in this.objects)
                this.objects[object].update();
            // collision check
            for (var i = 0; i < this.objects.length - 1; i++)
                for (var j = i + 1; j < this.objects.length; j++) {
                    var first:  GameObject = this.objects[i];
                    var second: GameObject = this.objects[j];
                    if (first.testCollision(second)) {
                        first.onCollide(second);
                        second.onCollide(first);
                    }
                }
        }

        startIntroPhase() {
            this.introPhase = true;
        }

        endIntroPhase() {
            this.introPhase = false;
            this.player = new PlayerShip(this, new Point(
                this.mission.playerPosition.x, this.mission.playerPosition.y));
        }

        isIntroPhase() {
            return this.introPhase;
        }
    }
} 