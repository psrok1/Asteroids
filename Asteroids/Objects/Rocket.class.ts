module Objects {
    export class Rocket extends GameObject {
        world: World;
        distance: number;

        constructor(world: World, source: Ship, headType: number) {
            var resID: string = "rocket1" + headType;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            var velocity: Vector = source.getVelocity().clone();
            var position: TorusPoint = source.getPosition().clone();
            velocity.rotation = source.getRotation();
            velocity.length = 20;
            velocity.add(source.getVelocity());
            for (var i = 0; i < 3; i++)
                position.move(velocity);
            this.distance = 600;
            super(world, sprite, position, source.getVelocity().clone(), 16, 20);
            this.setRotation(source.getRotation());
        }
        update() {
            super.update();
            this.distance -= this.getVelocity().length;
            var accelerationForce = new Vector(1, 1);
            accelerationForce.rotation = this.getRotation();
            accelerationForce.length = 0.5;
            this.applyForce(accelerationForce);
            if (this.distance <= 0) {
                destroyObjectToFragments(this);
                this.world.destroyObject(this);
            }
        }
        onCollide(which: GameObject) {
            // DEBUG
            if (which instanceof Crystal)
                return;
            this.distance = 0;
        }
    }
}