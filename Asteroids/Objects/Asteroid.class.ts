﻿module Objects {
    export class Asteroid extends GameObject {
        private generation: number;
        private type: number;
        private settings: AsteroidSettings;
        private hitsToGo: number;
        private hitsToChip: number;

        constructor(world: World,
            type: number,
            position: Point,
            velocity: Vector,
            settings: AsteroidSettings,
            generation: number = 0) {
            var resID: string = "asteroid" + type;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            sprite.scale.x = sprite.scale.y = 1 / (1 << generation);
            var maxVelocity: number = 2;
            this.generation = generation;
            this.type = type;
            this.settings = settings;
            this.hitsToGo = this.settings.hitsToGo;
            this.hitsToChip = this.settings.hitsToChip;
            super(world, sprite, position, velocity, 64 / (1 << generation), maxVelocity);
        }

        onDestroy() {
            super.onDestroy();
            if (this.generation < 2) {
                var velocity1 = this.getVelocity().clone();
                var velocity2 = this.getVelocity().clone();
                velocity1.rotate(-Math.PI / 4);
                velocity2.rotate(Math.PI / 4);
                new Asteroid(this.world, this.type, this.getPosition().clone(), velocity1, this.settings, this.generation + 1);
                new Asteroid(this.world, this.type, this.getPosition().clone(), velocity2, this.settings, this.generation + 1);
            }
            for (var i = 0; i < this.settings.crystalsMaxAmount * Math.random(); i++)
                new Crystal(this.world, Math.floor(4 * Math.random() + 1) * 10 + Math.floor(this.settings.crystalsMaxType * Math.random()), this.getPosition().clone(), 4);
        }

        onCollide(which: GameObject) {
            var attackForce = 0;
            if (which instanceof Bullet) {
                attackForce = 1;
                if ((<Bullet>which).source === this.world.player)
                    attackForce += Player.getSkillValue(2) / 100;
            }
            if (which instanceof Rocket)
                attackForce = ((<Rocket>which).headType === RocketHeadingType.Explosive ? 5 : 2);
            if (which instanceof Ship) {
                this.hitsToGo = 0;
            }
            this.hitsToGo -= attackForce;
            if(this.settings.chipping)
                this.hitsToChip -= attackForce;
            if (this.generation == 0 && this.settings.chipping &&
                this.hitsToChip <= 0 && this.hitsToGo > 0) {
                this.hitsToChip = this.settings.hitsToChip;
                var positionChip = this.getPosition().clone();
                var velocityChip = this.getVelocity().clone();
                velocityChip.rotate(randomFromRange(-Math.PI, Math.PI));
                velocityChip.length = 64;
                positionChip.move(velocityChip);
                velocityChip.length = this.getVelocity().length;
                new Asteroid(this.world, this.type, positionChip, velocityChip, this.settings, 2);
            }
            if (this.hitsToGo <= 0)
                this.world.destroyObject(this);
        }
    }

    export interface AsteroidSettings {
        hitsToGo: number;
        chipping?: boolean;
        hitsToChip?: number;
        crystalsMaxAmount: number;
        crystalsMaxType: number;
    }
} 