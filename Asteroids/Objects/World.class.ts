﻿module Objects {
    export class World {
        view: Layout.GameView;
        objects: GameObject[] = new Array();
        CPUobjects: CPUShip[] = new Array();
        crystalsAmount: number[] = [0, 0, 0, 0];
        objectCounter: { [id: string]: number; } = {};
        width: number;
        height: number;
        player: PlayerShip;
        private introPhase: boolean;
        private mission: Mission;
        private gameMode: boolean = false;
        private paused: boolean = true;
        unreachableTarget: boolean = false;
        spawnedSupportSoldiers: boolean = false;

        constructor(view: Layout.GameView, mission: Mission) {
            this.mission = mission;
            this.resetNotifications();
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

        /*** OBJECT COUNTERS ***/

        increaseCounter(counterType: string) {
            if (this.objectCounter[counterType])
                this.objectCounter[counterType]++;
            else
                this.objectCounter[counterType] = 1;
        }

        decreaseCounter(counterType: string) {
            if (this.objectCounter[counterType] && this.objectCounter[counterType] > 0)
                this.objectCounter[counterType]--;
            else
                throw new Error("Object counter '" + counterType + "' is less than zero");
        }

        getCounter(counterType: string): number {
            return (this.objectCounter[counterType] ? this.objectCounter[counterType] : 0);
        }

        checkCondition(condition: string): boolean {
            switch (condition) {
                case "":
                    return false;
                case "AlwaysTrue":
                    return true;
                case "CrystalsLeft":
                    return this.getCounter("Crystal") > 0;
                case "AsteroidsLeft":
                    return this.getCounter("Asteroid") > 0;
                case "ThievesLeft":
                    return this.getCounter("Thief") > 0;
                case "OnlyOneThiefLeft":
                    return this.getCounter("Thief") == 1;
                case "NoThievesLeft":
                    return this.getCounter("Thief") == 0;
                case "SoldiersLeft":
                    return this.getCounter("Soldier") > 0;
                case "PseudoSupportLeft":
                    return this.getCounter("PseudoSupport") > 0;
                case "SupportLeft":
                    return this.getCounter("Support") > 0;
                case "InvulnerableLeft":
                    return this.getCounter("Invulnerable") > 0;
                case "SoldiersDestroyed":
                    return (
                        !this.checkCondition("SoldiersLeft") &&
                        this.checkCondition("ThievesLeft")
                        );
                case "OnlyCrystalsLeft":
                    return (
                        this.checkCondition("CrystalsLeft") &&
                        !this.checkCondition("AsteroidsLeft") &&
                        !this.checkCondition("ThievesLeft")
                        );
                case "DestroyAll":
                    return (
                        !this.checkCondition("AsteroidsLeft") &&
                        !this.checkCondition("ThievesLeft")
                        );
                case "KillAndProtect":
                case "KillAll":
                    return (
                        !this.checkCondition("ThievesLeft") &&
                        !this.checkCondition("SoldiersLeft") &&
                        !this.checkCondition("PseudoSupportLeft") &&
                        !this.checkCondition("InvulnerableLeft")
                        );
            }
            throw new Error("Undefined condition '"+condition+"'");
        }

        checkTargetCondition(): boolean {
            if (this.unreachableTarget)
                return false;
            return this.checkCondition(this.mission.target);
        }

        checkProtectionCondition() {
            if (this.mission.target === "KillAndProtect" && this.getCounter("Support") == 0) {
                this.view.midGameNotification("Your support has been defeated.", 200);
                this.view.onGameOver();
            }
        }

        private resetNotifications() {
            if (!this.mission.notifications)
                return;
            for (var id in this.mission.notifications) {
                var notification = this.mission.notifications[id];
                notification.fired = false;
            }
        }

        checkNotificationCondition() {
            for (var id in this.mission.notifications) {
                var notification = this.mission.notifications[id];
                if (!notification.fired && this.checkCondition(notification.condition)) {
                    this.view.midGameNotification(notification.message, notification.duration);
                    notification.fired = true;
                }
            }
        }

        createObject(object: MissionObject): GameObject {
            var position: Point = new Point(object.position.x, object.position.y);
            var velocity: Vector = new Vector(object.velocity.x, object.velocity.y);
            var gameObject: GameObject = createObjectFromModel(object.model, this, position, velocity);
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
                if (object instanceof Crystal || object instanceof Bullet || object instanceof Rocket)
                    continue;
                var relPosition = object.getPosition().getRelative(rayStart);
                if (rayIntersectsObject(new Point(0,0), rayVector, relPosition, object.getRadius())) {
                    var posVector: Vector = relPosition.getPositionVector();
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
            if (this.isGameMode()) {
                this.checkNotificationCondition();
                if (this.checkTargetCondition()) {
                    this.view.onGameOver(true);
                    this.getCrystalsFromWorld();
                    Player.nextMission();
                }
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

        bestSpawnPosition() {
            var getRandomPosition = (world: World): TorusPoint => {
                var x = randomFromRange(-world.width / 2, world.width / 2);
                var y = randomFromRange(-world.height / 2, world.height / 2);
                return new TorusPoint(x, y, world.width, world.height);
            }
            var getMinimumDistance = (world: World, position: TorusPoint): number => {
                var dist: number = Infinity;
                for (var i = 0; i < world.objects.length; i++) {
                    var object = world.objects[i];
                    if (object instanceof Crystal)
                        continue;
                    var posVector = object.getPosition().getRelative(position).getPositionVector();
                    if (dist === Infinity || dist > posVector.length)
                        dist = posVector.length;
                }
                return dist;
            }
            var bestPoint: TorusPoint = null;
            var bestPointDistance: number = null;
            for (var i = 0; i < 50; i++) {
                var point = getRandomPosition(this);
                var distance = getMinimumDistance(this, point);
                if (distance === Infinity || distance > 300)
                    return point;
                else
                    if (bestPointDistance === null || bestPointDistance > distance) {
                        bestPoint = point;
                        bestPointDistance = distance;
                    }
            }
            return bestPoint;
        }

        spawnSupportSoldiers(unreachableTarget: boolean) {
            if (this.spawnedSupportSoldiers)
                return;
            this.spawnedSupportSoldiers = true;
            if(unreachableTarget)
                this.unreachableTarget = true;
            for (var i = 0; i < 4; i++) {
                new SupportShip(this, this.bestSpawnPosition(),
                    new PolarVector(randomFromRange(0, 2 * Math.PI), 5), { soldier: true });
            }
            this.view.midGameNotification("You were not careful enough.\nI'm sorry, but game is over.", 200);
        }
    }
} 