module Objects {
    export class Ship extends GameObject {
        world: World;
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
    }
} 