module Objects {
    export class Rocket extends GameObject {
        world: World;
        distance: number;
        source: Ship;
        headType: RocketHeadingType;

        constructor(world: World, source: Ship, headType: RocketHeadingType) {
            var resID: string = "rocket1" + headType;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            var position: TorusPoint = source.getPosition().clone();
            var velocity: Vector = new PolarVector(source.getRotation(), 32);
            velocity.add(source.getVelocity());
            for (var i = 0; i < 3; i++)
                position.move(velocity);
            this.distance = 600;
            this.headType = headType;
            this.source = source;
            super(world, sprite, position, source.getVelocity().clone(), 16, 20);
            this.setRotation(source.getRotation());
        }
        update() {
            super.update();
            this.distance -= this.getVelocity().length;
            var accelerationForce = new PolarVector(this.getRotation(), 0.5);
            this.applyForce(accelerationForce);
            if (this.distance <= 0) {
                destroyObjectToFragments(this);
                this.world.destroyObject(this);
            }
        }
        onCollide(which: GameObject) {
            if (which instanceof Crystal || which instanceof Bullet || which instanceof Rocket)
                return;
            this.distance = 0;
        }
    }

    export enum RocketHeadingType {
        Standard = 0,
        Explosive = 1,
        EngineBreaker = 2,
        GunSilencer = 3,
        Flashbang = 4,
        Gravity = 5
    }
}