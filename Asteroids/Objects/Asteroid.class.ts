module Objects {
    export class Asteroid extends GameObject {
        private generation: number;
        private type: number;

        constructor(world: World,
            type: number,
            position: Point,
            velocity: Vector,
            generation: number = 0) {
            var resID: string = "asteroid" + type;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            sprite.scale.x = sprite.scale.y = 1 / (1<<generation);
            var maxVelocity: number = 10;
            this.generation = generation;
            this.type = type;
            super(world, sprite, position, velocity, 64 / (1<<generation), maxVelocity);
        }

        onDestroy() {
            super.onDestroy();
            if (this.generation < 2) {
                var velocity1 = this.getVelocity().clone();
                var velocity2 = this.getVelocity().clone();
                velocity1.rotate(-Math.PI / 4);
                velocity2.rotate(Math.PI / 4);
                new Asteroid(this.world, this.type, this.getPosition().clone(), velocity1, this.generation + 1);
                new Asteroid(this.world, this.type, this.getPosition().clone(), velocity2, this.generation + 1);
            }
            for (var i = 0; i < 10 * Math.random(); i++)
                new Crystal(this.world, Math.floor(4 * Math.random() + 1) * 10 + Math.floor(5 * Math.random()), this.getPosition().clone(), 4);
        }

        onCollide(which: GameObject) {
            if (which instanceof Bullet || which instanceof Ship)
                this.world.destroyObject(this);
        }
    }
} 