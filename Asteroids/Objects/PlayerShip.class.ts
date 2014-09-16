﻿module Objects {
    export class PlayerShip extends Ship {  
        world: World;
        armor: number = 100;
        armorMaximum: number;
        attackForce: number;

        constructor(world: World, position: Point) {
            super(world, 3, position, new Vector(), 32, 5);
            this.armor = this.armorMaximum = Player.evaluatePlayerArmor();
            this.attackForce = Player.evaluatePlayerAttack();
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
            this.world.crystalsAmount[crystal.type] += valueArray[crystal.sizeClass];
        }
         
        onDestroy() {
            if(this.world.isGameMode())
                this.world.view.onGameOver();
            super.onDestroy();
        }
    }
} 