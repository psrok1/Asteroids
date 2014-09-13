module Objects {
    export class CPUShip extends Ship {
        world: World;
        private shotDelay: number = 0;
        follow: boolean = false;
        targetObject: GameObject = null;
        attackForce: number = 5;

        // DEBUG
        armor: number = 40;
        armorMaximum: number = 40;

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
            // DEBUG: Experiment
            if (object instanceof Crystal)
                return -1;

            var AHEAD_WIDTH = this.getRadius() + 32;

            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var distance: Vector = position.getPositionVector();
            if (distance.length > ahead.length + object.getRadius())
                return -1;
            for (var i = -1; i <= 1; i++) {
                var ray = {
                    x: AHEAD_WIDTH * Math.cos(-ahead.rotation + i * Math.PI / 2),
                    y: AHEAD_WIDTH * Math.sin(-ahead.rotation + i * Math.PI / 2)
                };
                // DEBUG: EXPERIMENT (hardcoded +32 calibration)
                if (rayIntersectsObject(<Point>ray, ahead, position, object.getRadius() + 32))
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
            if (this.shotDelay <= 0) {
                if (randomFromRange(0, 80) <= 70) {
                    this.shot();
                    this.shotDelay = 10;
                }
                else {
                    this.rocketShot();
                    this.shotDelay = 40;
                }
            }
        }
        attackObject(object: GameObject): boolean {
            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var ray: Point = new Point(0, 0);
            var ahead: Vector = this.getVelocity().clone();
            ahead.length = 512;
            if (rayIntersectsObject(ray, ahead, position, object.getRadius())) {
                this.attack();
                return true;
            } else
                return false;
        }
        escapeObject(object: GameObject, escapeDistance: number = 512): boolean {
            var MAX_FORCE = 0.2;

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

        findNearestTarget(type: any, distanceLimit: number = Infinity): GameObject {
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
                if (this.isTargetReserved(object))
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
            this.world.CPUobjects.splice(this.world.CPUobjects.indexOf(this),1);
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
        settings: ThiefShipSettings;

        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            settings: ThiefShipSettings = { }) {
            // type = 1, radius = 32, maxVelocity = 5
            super(world, 1, position, velocity, 32, 5);
            this.settings = settings;
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
            if (this.settings.avoidPlayer || (this.settings.avoidPlayerAfterAttack && this.attacked))
                if (this.escapeObject(this.world.player, 400)) {
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

        update() {
            if (!this.avoidObstacle() && !this.world.isIntroPhase()) {
                if (!this.playerInteraction()) {
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

        onBulletHit(bullet: Bullet): boolean {
            if(bullet.source === this.world.player)
                this.setAsAttacked();
            return super.onBulletHit(bullet);
        }
    }

    export interface ThiefShipSettings {
        avoidPlayer?: boolean;
        avoidPlayerAfterAttack?: boolean;
        attackPlayer?: boolean;
        attackPlayerAfterAttack?: boolean;
        followPlayer?: boolean;
        followPlayerAfterAttack?: boolean;
        propagateAttack?: boolean;
    }

    export class SoldierShip extends CPUShip {
        world: World;
        armor: number = 120;
        armorMaximum: number = 120;
        kamikazeClock: number = 20;
        settings: SoldierShipSettings;

        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            settings: SoldierShipSettings = {}) {
            // Standard: type = 7, radius = 32, maxVelocity = 5
            // Heavy:    type = 6, radius = 32, maxVelocity = 3
            super(world,
                (settings.heavyBattleship ? 6 : 7),
                position, velocity, 32,
                (settings.heavyBattleship ? 3 : 5));
            if (settings.invulnerable)
                this.invulnerable = true;
            this.settings = settings;
        }

        attack() {
            if (this.kamikazeClock > 0)
                this.kamikazeClock--;
            super.attack();
        }

        update() {
            if (!this.avoidObstacle() && !this.world.isIntroPhase()) {
                if (!this.settings.ignorePlayer) {
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
    }
}