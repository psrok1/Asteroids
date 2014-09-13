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
                this.armor -= evaluateDamage(this, bullet, bullet.source.attackForce);
                return true;
            }
            return false;
        }

        onRocketHit(rocket: Rocket): boolean {
            this.doLightning();
            if (!this.invulnerable) {
                this.armor -= evaluateDamage(this, rocket, 25);
                return true;
            }
            return false;
        }

        onAsteroidHit(asteroid: Asteroid): boolean { return false; }
        onShipHit(ship: Ship): boolean { return false; }

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