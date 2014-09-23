module Objects {
    export class Asteroid extends GameObject {
        generation: number;
        type: number;
        settings: AsteroidSettings;
        hitsToGo: number;
        hitsToChip: number;

        _abstract() { throw new Error("Asteroid is an abstract class."); }

        constructor(world: World,
            type: number,
            position: Point,
            velocity: Vector,
            settings: AsteroidSettings,
            generation: number = 0,
            noscale: boolean = false) {
            this._abstract();
            var resID: string = "asteroid1" + type;
            var sprite: PIXI.Sprite = new PIXI.Sprite(Resources.getObject(resID));
            if (!noscale)
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
        }

        onHit(force: number) { }

        onCollide(which: GameObject) {
            var attackForce = 0;
            if (which instanceof Bullet) {
                attackForce = 1;
                if ((<Bullet>which).source === this.world.player)
                    attackForce += Player.getSkillValue(2) / 100;
                this.hitsToGo -= attackForce;
                this.onHit(attackForce);
            } else
            if (which instanceof Rocket) {
                attackForce = ((<Rocket>which).headType === RocketHeadingType.Explosive ? 5 : 2);
                this.hitsToGo -= attackForce;
                this.onHit(attackForce);
            } else
            if (which instanceof Ship) {
                this.hitsToGo = 0;
            }
            if (this.hitsToGo <= 0)
                this.world.destroyObject(this);
        }
    }
    
    export class StandardAsteroid extends Asteroid {
        _abstract() { }

        constructor(world: World,
            position: Point,
            velocity: Vector,
            settings: AsteroidSettings,
            generation: number = 0,
            type: number = Math.floor(Math.random() * 3)) {
            super(world, type, position, velocity, settings, generation); 
        }

        onDestroy() {
            super.onDestroy();
            if (this.generation < 2) {
                var velocity1 = this.getVelocity().clone();
                var velocity2 = this.getVelocity().clone();
                velocity1.rotate(-Math.PI / 4);
                velocity2.rotate(Math.PI / 4);
                new StandardAsteroid(this.world, this.getPosition().clone(), velocity1, this.settings, this.generation + 1, this.type);
                new StandardAsteroid(this.world, this.getPosition().clone(), velocity2, this.settings, this.generation + 1, this.type);
            }
            for (var i = 0; i < this.settings.crystalsMaxAmount * Math.random(); i++)
                new Crystal(this.world, Math.floor(4 * Math.random() + 1) * 10 + Math.floor(this.settings.crystalsMaxType * Math.random()), this.getPosition().clone(), 4);
        }

        onHit(force: number) {
            if (this.settings.chipping)
                this.hitsToChip -= force;
            if (this.generation == 0 && this.settings.chipping &&
                this.hitsToChip <= 0 && this.hitsToGo > 0) {
                this.hitsToChip = this.settings.hitsToChip;
                var positionChip = this.getPosition().clone();
                var velocityChip = this.getVelocity().clone();
                velocityChip.rotate(randomFromRange(-Math.PI, Math.PI));
                velocityChip.length = 64;
                positionChip.move(velocityChip);
                velocityChip.length = this.getVelocity().length;
                new StandardAsteroid(this.world, positionChip, velocityChip, this.settings, 2, this.type);
            }
        }
    }

    var CRYSTAL_ASTEROID_TYPE = 0;

    export class CrystalAsteroid extends Asteroid {
        _abstract() { }
        constructor(world: World,
            position: Point,
            velocity: Vector,
            settings: AsteroidSettings,
            type: number = (CRYSTAL_ASTEROID_TYPE++ % 4)) {
            super(world, type + 3, position, velocity, settings, 1, true);
        }

        onHit(force: number) {
            for (var i = 0; i < force; i++)
                new Crystal(this.world, (this.type - 2) * 10 + Math.floor(5 * Math.random()), this.getPosition().clone(), 4);
        }

        onDestroy() {
            super.onDestroy();
            for (var i = 0; i < randomFromRange(15,25); i++)
                new Crystal(this.world, (this.type - 2) * 10 + Math.floor(5 * Math.random()), this.getPosition().clone(), 4);
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