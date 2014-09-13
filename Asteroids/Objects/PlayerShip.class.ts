module Objects {
    export class PlayerShip extends Ship {  
        world: World;
        armor: number = 100;
        armorMaximum: number = 100;
        attackForce: number = 5;

        constructor(world: World, position: Point) {
            super(world, 3, position, new Vector(), 32, 5);
        } 
        onCollide(which: GameObject) {
            if (which instanceof Bullet) {
                this.world.view.shakeCamera();
            } else if (which instanceof Rocket) {
                this.world.view.doDistortion();
                this.world.view.shakeCamera();
            } else if (which instanceof Ship || which instanceof Asteroid) {
                this.world.view.doCriticalBlur();
                this.world.view.shakeCamera();
            }
            super.onCollide(which);
        }
        onDestroy() {
            this.world.view.onGameOver();
            super.onDestroy();
        }
    }
} 