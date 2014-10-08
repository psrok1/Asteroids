module Objects {
    export class Crystal extends GameObject {
        world: World;
        type: number;
        sizeClass: number;

        constructor(
            world: World,
            type: number,
            position: Point,
            radius: number) {
            var resID: string = "crystal" + type;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            var velocity: Vector = new PolarVector(randomFromRange(0, 2 * Math.PI), randomFromRange(2, 6));
            this.sizeClass = type % 10; 
            this.type = Math.floor(type / 10) - 1;
            world.increaseCounter("Crystal");
            super(world, sprite, position, velocity, radius, 6);
        }

        onObjectNear(which: GameObject) {
            if (which instanceof Ship) {
                var posVector = which.getPosition().getRelative(this.getPosition()).getPositionVector();
                posVector.length = 0.5 + (posVector.length - (this.getRadius()+which.getRadius()))/64;
                this.applyForce(posVector);
            }
        }

        update() {
            var velocity: Vector = this.getVelocity();
            var velLen: number = velocity.length;
            velLen -= velLen / (20+(6-this.sizeClass)*5);
            if (velLen < 0)
                velLen = 0;
            velocity.length = velLen;
            super.update();
        }

        onDestroy() {
            this.world.decreaseCounter("Crystal");
            super.onDestroy();
        }

        onCollide(which: GameObject) {
            if (which instanceof Ship)
                this.world.destroyObject(this);
        }
    }
} 