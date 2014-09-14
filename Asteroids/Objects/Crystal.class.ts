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
            var velocity: Vector = new Vector(1, 1);
            velocity.length   = Math.random() * 4 + 2;
            velocity.rotation = Math.random() * 2 * Math.PI; 
            this.sizeClass = type % 10; 
            this.type = Math.floor(type / 10)-1;
            super(world, sprite, position, velocity, radius, 6);
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

        onCollide(which: GameObject) {
            if (which instanceof Ship)
                this.world.destroyObject(this);
        }
    }
} 