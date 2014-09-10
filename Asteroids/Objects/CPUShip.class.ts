module Objects {
    export class CPUShip extends Ship {
        world: World;
        private shotDelay: number = 0;
        follow: boolean = false;

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
            this.attachRotationToVelocity();
        }
        private isThreatening(object: GameObject, ahead: Vector): number {
            // DEBUG: Experiment
            if (object instanceof Crystal)
                return -1;

            var AHEAD_WIDTH = this.getRadius() + 32;

            var position: RelativeTorusPoint = new RelativeTorusPoint(object.getPosition(), this.getPosition());
            var distance: Vector = new Vector(position.x, position.y);
            if (distance.length > ahead.length + object.getRadius())
                return -1;
            for (var i = -1; i <= 1; i++) {
                var ray = {
                    x: AHEAD_WIDTH * Math.cos(-ahead.rotation + i * Math.PI / 2),
                    y: AHEAD_WIDTH * Math.sin(-ahead.rotation + i * Math.PI / 2)
                };
                // DEBUG: EXPERIMENT (hardcoded +32 calibration)
                if (rayIntersectsObject(<Point>ray, ahead, position, object.getRadius()+32))
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
            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var steering: Vector = new Vector(position.x, position.y);
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
            var steering: Vector = new Vector(position.x, position.y);
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
        escapeObject(object: GameObject): boolean {
            var MAX_FORCE = 0.2;
            var ESCAPE_DISTANCE = 512;

            var velLength: number = this.getVelocity().length;
            var position: RelativeTorusPoint = object.getPosition().getRelative(this.getPosition());
            var steering: Vector = new Vector(-position.x, -position.y);

            if (steering.length <= ESCAPE_DISTANCE) {
                steering.length = MAX_FORCE;
                this.applyForce(steering);
                this.getVelocity().length = velLength;
                return true;
            } else
                return false;
        }
        update() {
            var nearestCrystal: GameObject = null;
            var nearestAsteroid: GameObject = null;
            for (var i = 0; i < this.world.objects.length; i++) {
                var object: GameObject = this.world.objects[i];
                if (object instanceof Crystal) {
                    nearestCrystal = object;
                    break;
                } else
                if (object instanceof Asteroid) {
                    nearestAsteroid = object;
                }
            }
            if (!this.avoidObstacle()) {
                this.followObject(this.world.player);
                this.attackObject(this.world.player);
            } else
                this.follow = false;
            this.shotDelay--;
            super.update();
        }

        // DEBUG
        onCollide(which: GameObject) {
            if (which instanceof Bullet) {
                this.doExplosion();
                this.armor -= evaluateDamage(this, which, 5);
                if (this.armor <= 0)
                    this.world.destroyObject(this);
                else
                    this.showArmorBar();
            } else
                if (which instanceof Rocket) {
                    this.doLightning();
                    this.armor -= evaluateDamage(this, which, 25);
                    if (this.armor <= 0)
                        this.world.destroyObject(this);
                    else
                        this.showArmorBar();
                } else
                if (which instanceof PlayerShip) {
                    this.doExplosion();
                    this.armor -= evaluateDamage(this, which, 160);
                    if (this.armor <= 0)
                        this.world.destroyObject(this);
                    else
                        this.showArmorBar();

                } else
                    // DEBUG Experiment: Post-collision avoiding
                    if (which instanceof CPUShip) {
                        this.escapeObject(which);
                    }
        }
    }
}