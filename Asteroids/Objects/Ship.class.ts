module Objects {
    export class Ship extends GameObject {
        world: World;
        attackForce: number;
        constructor(
            world: World,
            type: number,
            position: Point,
            velocity: Vector,
            radius: number,
            maxVelocity: number) {
            var resID: string = "ship" + type;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            super(world, sprite, position, velocity, radius, maxVelocity);
        }
        onDestroy() {
            super.onDestroy();
            destroyObjectToFragments(this);
        }
        shot() {
            new Bullet(this.world, this);
        }
        rocketShot() {
            new Rocket(this.world, this, 1);
        }
        onCollide(which: GameObject) {
            var damaged = false;
            if (which instanceof Bullet) {
                this.doExplosion();
                damaged = true;
                if (!this.invulnerable)
                    this.armor -= evaluateDamage(this, which, (<Bullet>which).source.attackForce);
            } else if (which instanceof Rocket) {
                this.doLightning();
                damaged = true;
                // DEBUG: Hardcoded rocket attack
                if (!this.invulnerable)
                    this.armor -= evaluateDamage(this, which, 25);
            } else if (which instanceof Ship || which instanceof Asteroid) {
                this.doExplosion();
                damaged = true;
                if (!this.invulnerable)
                    this.armor -= evaluateDamage(this, which, this.armorMaximum);
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