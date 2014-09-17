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
                }
                this.armor -= evaluateDamage(this, rocket, attackForce);
                return true;
            }
            return false;
        }

        onAsteroidHit(asteroid: Asteroid): boolean { return false; }
        onShipHit(ship: Ship): boolean { return false; }
        onCrystalHit(crystal: Crystal) { }

        shot() {
            new Bullet(this.world, this);
        }
        rocketShot() {
            new Rocket(this.world, this, 1);
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
    }
}