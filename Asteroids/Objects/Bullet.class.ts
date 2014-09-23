module Objects {
    export class Bullet extends GameObject {
        world: World;
        source: Ship;
        distance: number;

        constructor(world: World, source: Ship) {
            var resID: string = (source instanceof PlayerShip || source instanceof SupportShip
                || (source instanceof ThiefShip && (<ThiefShip>source).settings.spy)
                ? "bullet2" : "bullet1");
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            var position: TorusPoint = source.getPosition().clone();
            var velocity: Vector = new PolarVector(source.getRotation(), 20);
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
            if (which instanceof Crystal || which instanceof Bullet || which instanceof Rocket)
                return;
            this.distance = 0;
        } 
    }
}