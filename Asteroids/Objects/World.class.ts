module Objects {
    export class World {
        view: Layout.GameView;
        objects: GameObject[] = new Array();
        CPUobjects: CPUShip[] = new Array();
        crystalsAmount: number[] = [0, 0, 0, 0];
        width: number;
        height: number;
        player: PlayerShip;
        private introPhase: boolean;
        private mission: Mission;
        private gameMode: boolean = false;
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

        getCrystalsFromWorld() {
            for (var i = 0; i < 4; i++)
                Player.setCrystalAmount(i, Player.getCrystalAmount(i) + this.crystalsAmount[i]);
        }

        checkTargetCondition(): boolean {
            switch (this.mission.target) {
                case "CollectAll":
                    if (this.objects.length <= this.CPUobjects.length + 1) {
                        for (var i = 0; i < this.objects.length; i++)
                            if (!(this.objects[i] instanceof Ship))
                                return false;
                            else {
                                var ship = <Ship>this.objects[i];
                                if (!(ship instanceof PlayerShip || ship instanceof SupportShip || ship.invulnerable))
                                    return false;
                            }
                        return true;
                    }
                    break;
                case "KillAll":
                    for (var i = 0; i < this.CPUobjects.length; i++)
                        if (!(this.CPUobjects[i] instanceof SupportShip))
                            return false;
                    return true;
            }
            return false;
        }

        createObject(object: MissionObject): GameObject {
            var position: Point = new Point(object.position.x, object.position.y);
            var velocity: Vector = new Vector(object.velocity.x, object.velocity.y);
            var gameObject: GameObject = null;
            switch (object.model) {
                case "basicAsteroid":
                    gameObject = new Asteroid(this, 10, position, velocity, {
                        hitsToGo: 1,
                        crystalsMaxAmount: 5,
                        crystalsMaxType: 3
                    });
                    break;
                case "basicHarderAsteroid":
                    gameObject = new Asteroid(this, 10, position, velocity, {
                        hitsToGo: 4,
                        crystalsMaxAmount: 8,
                        crystalsMaxType: 3
                    });
                    break;
                case "asteroid":
                    gameObject = new Asteroid(this, 11, position, velocity, {
                        hitsToGo: 3,
                        crystalsMaxAmount: 8,
                        crystalsMaxType: 4
                    });
                    break;
                case "harderAsteroid":
                    gameObject = new Asteroid(this, 11, position, velocity, {
                        hitsToGo: 6,
                        crystalsMaxAmount: 12,
                        crystalsMaxType: 4
                    });
                    break;
                case "thief":
                    gameObject = new ThiefShip(this, position, velocity, {
                        propagateAttack: true
                    });
                    break;
                case "frightenedThief":
                    gameObject = new ThiefShip(this, position, velocity, {
                        avoidPlayerAfterAttack: true
                    });
                    break;
                case "helperThief":
                    gameObject = new ThiefShip(this, position, velocity, {
                        attackPlayer: true
                    });
                    break;
                case "trapThief":
                    gameObject = new ThiefShip(this, position, velocity, {
                        avoidPlayerBeforeAttack: true,
                        followPlayerAfterAttack: true,
                        attackPlayerAfterAttack: true,
                        propagateAttack: true
                    });
                    break;
                case "soldier":
                    gameObject = new SoldierShip(this, position, velocity);
                    break;
                case "support":
                    gameObject = new SupportShip(this, position, velocity, {soldier:true});
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

        nearestOnTheRay(rayStart: Point, rayVector: Vector, exclude: GameObject): GameObject {
            var nearestObject: GameObject = null;
            var nearestLength: number = null;
            for (var index in this.objects) {
                var object: GameObject = this.objects[index];
                if (object === exclude)
                    continue;
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

        enableGameMode() {
            this.gameMode = true;
        }

        disableGameMode() {
            this.gameMode = false;
        }

        isGameMode(): boolean {
            return this.gameMode;
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
                    } else if (first.testNearness(second)) {
                        first.onObjectNear(second);
                        second.onObjectNear(first);
                    }
                }
            if (this.isGameMode() && this.checkTargetCondition()) {
                this.view.onGameOver(true);
                this.getCrystalsFromWorld();
                Player.nextMission();
            }
            Benchmark.setObjectCounter(this.objects.length);
        }

        startIntroPhase() {
            this.introPhase = true;
            this.disableGameMode();
        }

        endIntroPhase() {
            this.introPhase = false;
            this.enableGameMode();
            this.player = new PlayerShip(this, new Point(
                this.mission.playerPosition.x, this.mission.playerPosition.y));
        }

        isIntroPhase() {
            return this.introPhase;
        }
    }
} 