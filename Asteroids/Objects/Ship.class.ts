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
            var bullet = new Bullet(this.world, this);
            this.world.objects.push(bullet);
        }
        rocketShot() {
            var bullet = new Rocket(this.world, this, 1);
            this.world.objects.push(bullet);
        }
    }
} 