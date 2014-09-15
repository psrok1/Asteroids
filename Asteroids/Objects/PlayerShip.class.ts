module Objects {
    export class PlayerShip extends Ship {  
        world: World;
        armor: number = 100;
        armorMaximum: number = 100;
        attackForce: number = 5;

        constructor(world: World, position: Point) {
            super(world, 3, position, new Vector(), 32, 5);
        }

        onShipHit(ship: Ship): boolean {
            this.world.view.doCriticalBlur();
            this.world.view.shakeCamera();
            this.armor -= evaluateDamage(this, ship, this.armorMaximum);
            return true;
        }

        onBulletHit(bullet: Bullet): boolean {
            this.world.view.shakeCamera();
            return super.onBulletHit(bullet);
        }

        onRocketHit(rocket: Rocket): boolean {
            this.world.view.doDistortion();
            this.world.view.shakeCamera();
            return super.onRocketHit(rocket);
        }

        onAsteroidHit(asteroid: Asteroid): boolean {
            this.world.view.doCriticalBlur();
            this.world.view.shakeCamera();
            this.armor -= evaluateDamage(this, asteroid, this.armorMaximum);
            return true;
        }

        onCrystalHit(crystal: Crystal) {
            var valueArray = [1, 2, 3, 5, 8];
            Player.setCrystalAmount(crystal.type, Player.getCrystalAmount(crystal.type) + valueArray[crystal.sizeClass]);
        }
         
        onDestroy() {
            if(this.world.isGameMode())
                this.world.view.onGameOver();
            super.onDestroy();
        }
    }
} 