module Objects {
    export class Ship extends GameObject {
        world: World;
        attackForce: number;
        engineFailure: number;
        gunFailure: number;
        constructor(
            world: World,
            type: number,
            position: Point,
            velocity: Vector,
            radius: number,
            maxVelocity: number) {
            var resID: string = "ship" + type;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            this.engineFailure = this.gunFailure = 0;
            super(world, sprite, position, velocity, radius, maxVelocity);
        }
        onDestroy() {
            super.onDestroy();
            destroyObjectToFragments(this);
        }
        onPlayerAttack(force: number) { }
        onBulletHit(bullet: Bullet): boolean {
            this.doExplosion();
            if (!this.invulnerable) {
                var attackForce = bullet.source.attackForce;
                if (bullet.source === this.world.player && Player.getSkillLevel(6) > 0)
                {
                    // Critical hit
                    var value = Player.getSkillValue(6) / 100;
                    var chance = 100 * (1 / ((1.25 - value) * 8 + 6));
                    if (randomFromRange(0, 100) < chance)
                        attackForce *= 1 + value;
                    this.onPlayerAttack(attackForce);
                }
                if (this instanceof PlayerShip && Player.getSkillLevel(15) > 0) {
                    // Dodge
                    if (randomFromRange(0, 100) < Player.getSkillValue(15))
                        return false;
                }
                this.armor -= evaluateDamage(this, bullet, attackForce);
                return true;
            }
            return false;
        }

        onRocketHit(rocket: Rocket): boolean {
            this.doLightning();
            if (!this.invulnerable) {
                var attackForce = rocket.source.attackForce * 4;
                if (rocket.source === this.world.player && Player.getSkillLevel(3) > 0) {
                    // Rocket launcher
                    attackForce *= 1 + (Player.getSkillValue(3) / 100);
                    this.onPlayerAttack(attackForce);
                }
                var sideEffectsTime = 200;
                // Endurance skill
                if (this === this.world.player && Player.getSkillLevel(10) > 0)
                    sideEffectsTime *= (1 - Player.getSkillValue(10) / 100);
                if (this === this.world.player && Player.getSkillLevel(12) > 0)
                    sideEffectsTime *= (1 - Player.getSkillValue(12) / 100);
                if (rocket.headType == RocketHeadingType.EngineBreaker ||
                    rocket.headType == RocketHeadingType.Flashbang)
                    this.engineFailure = sideEffectsTime;
                if (rocket.headType == RocketHeadingType.GunSilencer ||
                    rocket.headType == RocketHeadingType.Flashbang)
                    this.gunFailure = sideEffectsTime;
                this.armor -= evaluateDamage(this, rocket, attackForce);
                return true;
            }
            return false;
        }

        onAsteroidHit(asteroid: Asteroid): boolean { return false; }
        onShipHit(ship: Ship): boolean { return false; }
        onCrystalHit(crystal: Crystal) { }

        shot() {
            if (this.gunFailure)
                return;
            new Bullet(this.world, this);
        }
        rocketShot(headType: RocketHeadingType) {
            if (this.gunFailure)
                return;
            new Rocket(this.world, this, headType);
        }
        onCollide(which: GameObject) {
            var damaged = false;
            if (which instanceof Bullet) {
                if (this.onBulletHit(<Bullet>which))
                    damaged = true;
            } else if (which instanceof Rocket) {
                if (this.onRocketHit(<Rocket>which))
                    damaged = true;
            } else if (which instanceof Asteroid) {
                if (this.onAsteroidHit(<Asteroid>which))
                    damaged = true;
            } else if (which instanceof Ship) {
                if (this.onShipHit(<Ship>which))
                    damaged = true;
            } else if (which instanceof Crystal) {
                this.onCrystalHit(<Crystal>which);
            }
            if (damaged) {
                if (this.armor <= 0)
                    this.world.destroyObject(this);
                else
                    this.showArmorBar();
            }
            super.onCollide(which);
        }

        update() {
            this.gunFailure = (this.gunFailure > 0 ? this.gunFailure - 1 : 0);
            this.engineFailure = (this.engineFailure > 0 ? this.engineFailure - 1 : 0);
            super.update();
        }
    }
}