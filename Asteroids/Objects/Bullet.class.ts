module Objects {
    export class Bullet extends GameObject {
        world: World;
        source: Ship;
        distance: number;

        constructor(world: World, source: Ship) {
            var resID: string = (source instanceof PlayerShip ? "bullet2" : "bullet1");
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            var velocity: Vector = new Vector(1, 1);
            var position: TorusPoint = source.getPosition().clone();
            velocity.rotation = source.getRotation();
            velocity.length = 20;
            velocity.add(source.getVelocity());
            for(var i = 0; i < 3; i++)
                position.move(velocity);
            this.distance = 600;
            this.source = source;
            super(world, sprite, position, velocity, 16, 20);
        }
        update() {
            super.update();
            this.distance -= this.getVelocity().length;
            if (this.distance <= 0)
                this.world.destroyObject(this);
        }
        onCollide(which: GameObject) {
            // DEBUG
            if (which instanceof Crystal)
                return;
            this.distance = 0;
        } 
    }
}