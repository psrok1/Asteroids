module Objects {
    export class PlayerShip extends Ship {  
        world: World;
        armor: number = 100;
        armorMaximum: number = 100;

        constructor(world: World, position: Point) {
            super(world, 3, position, new Vector(), 32, 5);
        } 
        onCollide(which: GameObject) {
            if (which instanceof Bullet) {
                this.doExplosion();
                this.world.view.shakeCamera();
                this.armor -= evaluateDamage(this, which, 5);
                if (this.armor < 0) {
                    this.world.destroyObject(this);
                    this.armor = 0;
                }
                this.showArmorBar();
            } else
                if (which instanceof Rocket) {
                    this.doLightning();
                    this.world.view.doDistortion();
                    this.world.view.shakeCamera();
                    this.armor -= evaluateDamage(this, which, 25);
                    if (this.armor < 0) {
                        this.world.destroyObject(this);
                        this.armor = 0;
                    }
                    this.showArmorBar();
                } else
                if (which instanceof Ship || which instanceof Asteroid) {
                    this.doExplosion();
                    this.world.view.doCriticalBlur();
                    this.world.view.shakeCamera();
                    this.armor -= evaluateDamage(this, which, 80);
                    if (this.armor < 0) {
                        this.world.destroyObject(this);
                        this.armor = 0;
                    }
                    this.showArmorBar();
                }
        }
        onDestroy() {
            this.world.view.onGameOver();
            super.onDestroy();
        }
    }
} 