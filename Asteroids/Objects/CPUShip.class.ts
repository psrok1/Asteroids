﻿module Objects {
    export class CPUShip extends Ship {
        world: World;
        shotDelay: number = 0;
        follow: boolean = false;
        targetObject: GameObject = null;
        attackForce: number = 5;
        reward: number = 0;

        armor: number;
        armorMaximum: number;

        constructor(
            world: World,
            type: number,
            position: Point,
            velocity: Vector,
            radius: number,
            maxVelocity: number) {
            super(world, type, position, velocity, radius, maxVelocity);
            this.getVelocity().length = maxVelocity;
            this.attachRotationToVelocity();
            this.world.CPUobjects.push(this);
        }
        private isThreatening(object: GameObject, ahead: Vector): number {
            if (object instanceof Crystal || object instanceof Bullet)
                return -1;

            var AHEAD_WIDTH = this.getRadius() + 32;

            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var distance: Vector = position.getPositionVector();
            if (distance.length > ahead.length + object.getRadius())
                return -1;
            for (var i = -1; i <= 1; i++) {
                var ray = new PolarVector(-ahead.rotation + i * Math.PI / 2, AHEAD_WIDTH);
                // hardcoded +32 calibration
                if (rayIntersectsObject(ray, ahead, position, object.getRadius() + 32))
                    return distance.length;
            }
            return -1;
        }
        private getAheadForObject(object: GameObject, ahead: Vector) {
            var AHEAD_LENGTH: number = 192;
            var velocity: Vector = this.getVelocity();
            var aheadScale: number = velocity.length;
            ahead.assign(velocity);
            ahead.sub(object.getVelocity());
            aheadScale = ahead.length / aheadScale;
            ahead.length = AHEAD_LENGTH * aheadScale;
        }
        private findMostThreatening(): GameObject {
            var ahead: Vector = new Vector();
            var nearestObject: GameObject = null;
            var nearestObjectDist: number = -1;
            for (var index in this.world.objects) {
                var object: GameObject = this.world.objects[index];
                if (object === this)
                    continue;
                this.getAheadForObject(object, ahead);
                var objDistance: number = this.isThreatening(object, ahead);
                if (objDistance != -1 && (nearestObject === null || objDistance < nearestObjectDist)) {
                    nearestObject = object;
                    nearestObjectDist = objDistance;
                }
            }
            return nearestObject;
        }
        avoidObstacle(): boolean {
            var MAX_FORCE = 0.2;
            var avoidanceForce: Vector = new Vector();
            if (this.engineFailure > 0)
                return;
            var object: GameObject = this.findMostThreatening();
            if (object) {
                var velLength: number = this.getVelocity().length;
                var position: RelativeTorusPoint = new RelativeTorusPoint(object.getPosition(), this.getPosition());
                var positionVector: Vector = new Vector(-position.x, position.y);
                this.getAheadForObject(object, avoidanceForce);
                avoidanceForce.rotation += avoidanceForce.signOfSumRotation(positionVector) * Math.PI / 2;
                avoidanceForce.length = MAX_FORCE;
                this.applyForce(avoidanceForce);
                this.getVelocity().length = velLength;
                return true;
            } else
                return false; // no action
        }
        followObject(object: GameObject): boolean {
            var MAX_FORCE = 0.2;
            if (this.engineFailure > 0)
                return;
            var velLength: number = this.getVelocity().length;
            var steering: Vector = object.getPosition().getRelative(this.getPosition()).getPositionVector();
            if (this.follow == false && steering.length > 512)
                this.follow = true;
            if (this.follow == true && steering.length < 256)
                this.follow = false;
            if (this.follow) {
                steering.length = MAX_FORCE;
                this.applyForce(steering);
                this.getVelocity().length = velLength;
                return true;
            } else
                return false;
        }
        collectObject(object: GameObject): boolean {
            var MAX_FORCE = 0.2;
            if (this.engineFailure > 0)
                return;
            var velLength: number = this.getVelocity().length;
            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var steering: Vector = position.getPositionVector();
            var ahead: Vector = this.getVelocity().clone();
            ahead.length = 512;

            if (!this.follow && steering.length > 256)
                this.follow = true;
            if (this.follow && !rayIntersectsObject(new Point(0, 0), ahead, position, object.getRadius())
                && steering.length < 128)
                this.follow = false;
            if (this.follow) {
                steering.length = MAX_FORCE;
                this.applyForce(steering);
                this.getVelocity().length = velLength;
                return true;
            } else
                return false;
        }
        attack() {
            // debug
            if (this.shotDelay <= 0) {
                this.shot();
                this.shotDelay = 10;                
            }
        }
        attackObject(object: GameObject): boolean {
            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var ray: Point = new Point(0, 0);
            var ahead: Vector = this.getVelocity().clone();
            ahead.length = 512;
            if (rayIntersectsObject(ray, ahead, position, object.getRadius())) {
                var nearest = this.world.nearestOnTheRay(this.getPosition(), ahead, this);
                if (nearest === object)
                    this.attack();
                else if(nearest)
                    this.escapeObject(nearest);
                return true;
            } else
                return false;
        }
        escapeObject(object: GameObject, escapeDistance: number = 512): boolean {
            var MAX_FORCE = 0.2;
            if (this.engineFailure > 0)
                return;
            var velLength: number = this.getVelocity().length;
            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var steering: Vector = new Vector(-position.x, -position.y);

            if (steering.length <= escapeDistance) {
                steering.length = MAX_FORCE;
                this.applyForce(steering);
                this.getVelocity().length = velLength;
                return true;
            } else
                return false;
        }
        isTargetReserved(target: GameObject): boolean {
            for (var shipIndex in this.world.CPUobjects) {
                var ship: CPUShip = this.world.CPUobjects[shipIndex];
                if (ship.targetObject === target)
                    return true;
            }
            return false;
        }

        findNearestTarget(type: any, distanceLimit: number = Infinity, ignoreReserved: boolean = false): GameObject {
            var nearestTarget: GameObject = null;
            var nearestTargetScore: number = null;
            var ANGLE_WEIGHT = 200;
            for (var objectIndex in this.world.objects) {
                var object: GameObject = this.world.objects[objectIndex];
                if (!(object instanceof type))
                    continue;
                var distanceVector = object.getPosition().getRelative(this.getPosition()).getPositionVector();
                if (distanceLimit !== Infinity && distanceVector.length > distanceLimit)
                    continue;
                // reserved by another ship?
                if (!ignoreReserved && this.isTargetReserved(object))
                    continue;
                var targetAngleScore =
                    Math.abs(this.getVelocity().angleToVector(distanceVector)) / Math.PI * ANGLE_WEIGHT;
                var targetScore = (distanceVector.length + targetAngleScore) / 2;
                if (nearestTarget == null || nearestTargetScore > targetScore) {
                    nearestTarget = object;
                    nearestTargetScore = targetScore;
                }
            }
            return nearestTarget;
        }

        onDestroy() {
            this.world.CPUobjects.splice(this.world.CPUobjects.indexOf(this), 1);
            if (this.reward > 0) {
                for (var i = 0; i < 4; i++)
                    this.world.crystalsAmount[i] += Math.floor(randomFromRange(0.75 * this.reward, 1.25 * this.reward));
            }
            super.onDestroy();
        }

        update() {
            this.shotDelay--;
            super.update();
        }

        onShipHit(ship: Ship): boolean {
            if (ship instanceof PlayerShip)
                if (!this.invulnerable) {
                    this.armor -= evaluateDamage(this, ship, this.armorMaximum);
                    return true;
                }
            return false;
        }

        onCollide(which: GameObject) {
            // Post-collision avoidance
            if (which instanceof CPUShip || which instanceof Asteroid)
                this.escapeObject(which);
            super.onCollide(which);
        }
    }

    export class ThiefShip extends CPUShip {
        world: World;
        armor: number = 80;
        armorMaximum: number = 80;
        attacked: boolean = false;
        attackForce: number = 8;
        settings: ThiefShipSettings;

        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            settings: ThiefShipSettings = { }) {
            // Thief:type = 1, radius = 32, maxVelocity = 5
            // Spy:  type = 3, radius = 32, maxVelocity = 5            
            super(world, (settings.spy ? 3 : 1), position, velocity, 32, 5);
            this.settings = settings;
            this.world.increaseCounter("Thief");
            if (settings.reward)
                this.reward = settings.reward;
            if (settings.attack)
                this.attackForce = settings.attack;
            if (settings.armor)
                this.armor = this.armorMaximum = settings.armor;
        }

        private propagateAttack() {
            for (var objectIndex in this.world.CPUobjects)
                if (this.world.CPUobjects[objectIndex] instanceof ThiefShip)
                    (<ThiefShip>this.world.CPUobjects[objectIndex]).attacked = true;
        }

        private setAsAttacked() {
            this.attacked = true;
            if (this.settings.propagateAttack)
                this.propagateAttack();
        }

        private playerInteraction(): boolean {
            var result: boolean = false;
            if (this.settings.avoidPlayer || (this.settings.avoidPlayerAfterAttack && this.attacked) ||
                (this.settings.avoidPlayerBeforeAttack && !this.attacked))
                if (this.escapeObject(this.world.player, 300)) {
                    this.targetObject = null;
                    result = true;
                }
            if (this.settings.followPlayer || (this.settings.followPlayerAfterAttack && this.attacked)) {
                this.followObject(this.world.player);
                result = true;
            }
            if (this.settings.attackPlayer || (this.settings.attackPlayerAfterAttack && this.attacked))
                this.attackObject(this.world.player);
            return result;
        }

        onDestroy() {
            this.world.decreaseCounter("Thief");
            super.onDestroy();
        }

        attack() {
            if (this.shotDelay <= 0 && this.settings.explosiveRockets && randomFromRange(0, 100) < 20) {
                this.rocketShot(RocketHeadingType.Explosive);
                this.shotDelay = 40;
            }
            super.attack();
        }

        update() {
            if (!this.avoidObstacle() && this.world.isGameMode()) {
                if (!this.playerInteraction()) {
                    if (this.targetObject === null && this.settings.attackSupport)
                        this.targetObject = this.findNearestTarget(SupportShip, Infinity, true);
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(Crystal);
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(Asteroid);
                    if (this.targetObject !== null) {
                        if (this.targetObject instanceof Crystal)
                            this.collectObject(this.targetObject);
                        else {
                            this.followObject(this.targetObject);
                            this.attackObject(this.targetObject);
                        }
                        if (this.targetObject.destroyed)
                            this.targetObject = null;
                    }
                }
            } else
                this.follow = false;
            super.update();
        }

        onPlayerAttack(force: number) {
            this.setAsAttacked();
        }
    }

    export interface ThiefShipSettings {
        avoidPlayer?: boolean;
        avoidPlayerAfterAttack?: boolean;
        avoidPlayerBeforeAttack?: boolean;
        attackPlayer?: boolean;
        attackPlayerAfterAttack?: boolean;
        attackSupport?: boolean;
        followPlayer?: boolean;
        followPlayerAfterAttack?: boolean;
        propagateAttack?: boolean;
        explosiveRockets?: boolean;
        spy?: boolean;
        reward?: number;
        attack?: number;
        armor?: number;
    }

    export class SoldierShip extends CPUShip {
        world: World;
        armor: number = 120;
        armorMaximum: number = 120;
        kamikazeClock: number = 15;
        attackForce: number = 15;
        settings: SoldierShipSettings;

        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            settings: SoldierShipSettings = {}) {
            // Standard: type = 7, radius = 32, maxVelocity = 5
            // Heavy:    type = 6, radius = 32, maxVelocity = 4
            super(world,
                (settings.heavyBattleship ? 6 : 7),
                position, velocity, 32,
                (settings.heavyBattleship ? 4 : 5));
            if (settings.invulnerable)
                this.invulnerable = true;
            this.settings = settings;
            if (settings.reward)
                this.reward = settings.reward;
            if (settings.attack)
                this.attackForce = settings.attack;
            if (settings.armor)
                this.armor = this.armorMaximum = settings.armor;
            if (!settings.invulnerable && !settings.spawn)
                this.world.increaseCounter("Soldier");
        }

        attack() {
            if (this.kamikazeClock > 0)
                this.kamikazeClock--;
            if (this.shotDelay <= 0 && randomFromRange(0, 100) < 20) {
                var type: RocketHeadingType = RocketHeadingType.Standard;
                if (this.settings.EMPClassRockets && randomFromRange(0, 100) < 50)
                    type = (randomFromRange(0, 100) < 50
                        ? RocketHeadingType.EngineBreaker
                        : RocketHeadingType.GunSilencer);
                this.rocketShot(type);
                this.shotDelay = 40;
            }

            super.attack();
        }

        onDestroy() {
            if (this.settings.spawn) {
                // spawn
                new SoldierShip(this.world, this.world.bestSpawnPosition(),
                    new PolarVector(randomFromRange(0, 2 * Math.PI), 5), this.settings);
            }
            if (!this.settings.invulnerable && !this.settings.spawn)
                this.world.decreaseCounter("Soldier");
            super.onDestroy();
        }

        update() {
            if (!this.avoidObstacle() && this.world.isGameMode()) {
                if (this.settings.attackSupport) {
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(SupportShip);
                    if (this.targetObject !== null) {
                        if (this.targetObject.destroyed)
                            this.targetObject = null;
                        else {
                            this.followObject(this.targetObject);
                            this.attackObject(this.targetObject);
                        }
                    }
                }
                else if (!this.settings.ignorePlayer) {
                    if (this.settings.kamikazeMode && this.kamikazeClock <= 0) {
                        this.collectObject(this.world.player);
                    } else
                        this.followObject(this.world.player);
                    this.attackObject(this.world.player);
                }
            } else
                this.follow = false;
            super.update();
        }        
    }

    export interface SoldierShipSettings {
        heavyBattleship?: boolean;
        ignorePlayer?: boolean;
        invulnerable?: boolean;
        kamikazeMode?: boolean;
        attackSupport?: boolean; // implies ignorePlayer
        EMPClassRockets?: boolean;
        spawn?: boolean;
        reward?: number;
        attack?: number;
        armor?: number;
    }

    export class SupportShip extends CPUShip {
        world: World;
        armor: number = 80;
        armorMaximum: number = 80;
        settings: SupportShipSettings;
        target: Ship = null;
        playerAttack: number = 30;
        clockBomb: number = randomFromRange(5400, 7200); 

        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            settings: SupportShipSettings = {}) {
            // Standard: type = 3, radius = 32, maxVelocity = 5
            // Soldier:  type = 5, radius = 32, maxVelocity = 6
            super(world,
                (settings.soldier ? 5 : 3),
                position, velocity, 32,
                (settings.soldier ? 6 : 5));
            if (settings.soldier) {
                this.invulnerable = true;
                this.attackForce = 50;
            }
            this.settings = settings;
            if (settings.reward)
                this.reward = settings.reward;
            if (settings.attack)
                this.attackForce = settings.attack;
            if (settings.armor)
                this.armor = this.armorMaximum = settings.armor;
            if (settings.playerAttacker)
                this.world.increaseCounter("PseudoSupport");
            else if (!settings.soldier)
                this.world.increaseCounter("Support");
        }

        onCrystalHit(crystal: Crystal) {
            var valueArray = [1, 2, 3, 5, 8];
            this.world.crystalsAmount[crystal.type] += valueArray[crystal.sizeClass];
        }

        onPlayerAttack(force: number) {
            console.log(force);
            this.playerAttack -= force;
            if (this.playerAttack <= 0 && !this.world.spawnedSupportSoldiers && !this.settings.soldier)
                this.world.spawnSupportSoldiers((this.settings.playerAttacker ? false : true));
        }

        onDestroy() {
            if (this.settings.soldier) {
                // spawn
                new SupportShip(this.world, this.world.bestSpawnPosition(),
                    new PolarVector(randomFromRange(0, 2 * Math.PI), 5), this.settings);
            } else if (this.settings.playerAttacker)
                this.world.decreaseCounter("PseudoSupport");
            else {
                this.world.view.midGameNotification("Your support ship has been destroyed.", 200);
                this.world.decreaseCounter("Support");
                this.world.checkProtectionCondition();
            }
            super.onDestroy();
        }

        update() {
            if (!this.avoidObstacle() && this.world.isGameMode()) {
                if (!this.settings.soldier && !this.settings.playerAttacker) {
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(Crystal);
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(Asteroid);
                    if (this.targetObject !== null) {
                        if (this.targetObject instanceof Crystal)
                            this.collectObject(this.targetObject);
                        else {
                            this.followObject(this.targetObject);
                            this.attackObject(this.targetObject);
                        }
                        if (this.targetObject.destroyed)
                            this.targetObject = null;
                    }
                } else {
                    this.followObject(this.world.player);
                    this.attackObject(this.world.player);
                }
            } else
                this.follow = false;
            super.update();
            if (this.settings.clockBomb && this.clockBomb-- < 0)
                this.world.destroyObject(this);
        }
    }

    export interface SupportShipSettings {
        playerAttacker?: boolean;
        soldier?: boolean;
        reward?: number;
        clockBomb?: number;
        attack?: number;
        armor?: number;
    }

    export class InvulnerableShip extends CPUShip { // type 2
        world: World;
        armor: number = 240;
        armorMaximum: number = 240;
        attackForce: number = 40;
        settings: InvulnerableShipSettings;
        invulnerableTimer: number = 0;

        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            settings: InvulnerableShipSettings = {}) {
            super(world, 2, position, velocity, 32, 5);
            
            this.settings = settings;
            this.invulnerableTimer = 600;
            world.increaseCounter("Invulnerable");
            if (settings.reward)
                this.reward = settings.reward;
        }

        onCrystalHit(crystal: Crystal) {
            if (this.settings.crystalInvulnerable)
                this.invulnerableTimer = 600;
        }

        onDestroy() {
            this.world.decreaseCounter("Invulnerable");
            super.onDestroy();
        }

        update() {
            if (!this.avoidObstacle() && this.world.isGameMode()) {
                if (this.invulnerableTimer > 0) {
                    this.invulnerable = true;
                    this.invulnerableTimer--;
                    this.followObject(this.world.player);
                    this.attackObject(this.world.player);
                } else if (this.settings.crystalInvulnerable) {
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(Crystal);
                    if (this.targetObject === null)
                        this.targetObject = this.findNearestTarget(Asteroid);
                    if (this.targetObject !== null) {
                        if (this.targetObject instanceof Crystal)
                            this.collectObject(this.targetObject);
                        else {
                            this.followObject(this.targetObject);
                            this.attackObject(this.targetObject);
                        }
                        if (this.targetObject.destroyed)
                            this.targetObject = null;
                    }
                } else {
                    this.escapeObject(this.world.player);
                    this.invulnerableTimer--;
                    if (this.invulnerableTimer < -480)
                        this.invulnerableTimer = 600;
                }
            } else
                this.follow = false;
            super.update();
        }
    }

    export interface InvulnerableShipSettings {
        crystalInvulnerable?: boolean;
        reward?: number;
    }
}