module Objects {
    export class PlayerShip extends Ship {  
        world: World;
        armor: number = 100;
        armorMaximum: number;
        recoverClock: number = 0;
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
            if (rocket.headType === RocketHeadingType.EngineBreaker)
                this.world.view.showFailureNotification("ENGINE FAILURE");
            else if (rocket.headType === RocketHeadingType.GunSilencer)
                this.world.view.showFailureNotification("GUN FAILURE");
            else if (rocket.headType === RocketHeadingType.Flashbang)
                this.world.view.showFailureNotification("STUNNED");
            this.world.view.doDistortion();
            this.world.view.shakeCamera();
            return super.onRocketHit(rocket);
        }

        onAsteroidHit(asteroid: Asteroid): boolean {
            this.world.view.doCriticalBlur();
            this.world.view.shakeCamera();
            // Daredevil skill
            var scratchForce = this.armorMaximum * (1 - Player.getSkillValue(9) / 100);
            this.armor -= evaluateDamage(this, asteroid, scratchForce);
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

        update() {
            if (Player.getSkillLevel(13) > 0) {
                // Recovery
                if (this.recoverClock >= Player.getSkillValue(13) * 20) {
                    this.recoverClock = 0;
                    if(this.armor < this.armorMaximum)
                        this.armor++;
                }
                this.recoverClock++;
            }
            super.update();
        }
    }
} 