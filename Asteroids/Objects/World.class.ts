module Objects {
    export class World {
        view: Layout.GameView;
        objects: GameObject[];
        width: number;
        height: number;
        player: PlayerShip;

        private paused: boolean = true;

        constructor(view: Layout.GameView, scenarioID: string) {
            var scenario: Scenario = Resources.getObject(scenarioID);
            this.width  = scenario.width;
            this.height = scenario.height;
            this.view = view;
            this.objects = new Array();
            for (var object in scenario.objects)
                this.objects.push(this.createObject(scenario.objects[object]));
            this.player = new PlayerShip(this, new Point(
                scenario.playerPosition.x, scenario.playerPosition.y));
            this.objects.push(this.player);
            this.resume();
        }

        private createObject(object: ScenarioObject): GameObject {
            var position: Point = new Point(object.position.x, object.position.y);
            var velocity: Vector = new Vector(object.velocity.x, object.velocity.y);
            var gameObject: GameObject = null;
            switch (object.type) {
                // DEBUG: hard-coded types
                case "asteroid":
                    gameObject = new Asteroid(this, 10, position, velocity);
                    break;
                case "ship":
                    gameObject = new CPUShip(this, 2, position, velocity, 32, 5);
                    break;
                default:
                    throw new Error("Error: World.createObject failed. Unknown type of object '"+object.type+"'");
            }
            if (gameObject && object.name)
                gameObject.name = object.name;
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
                    var relPosition: RelativeTorusPoint = object.getPosition().getRelative(rayStart);
                    var posVector: Vector = new Vector(relPosition.x, relPosition.y);
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
    }
} 