module Objects {
    export class ObjectFragment extends GameObject {
        world: World;
        clock: number;
        explosionTime: number;
        constructor(
            world: World,
            position: Point,
            velocity: Vector,
            fragmentSprite: PIXI.Sprite) {
            super(world, fragmentSprite, position, velocity, 1, 1000);
            this.clock = 0;
            this.explosionTime = Math.floor(randomFromRange(15, 40));
        }

        update() {
            super.update();
            if(this.clock++ == this.explosionTime)
                this.doExplosion();
            if(this.clock == (this.explosionTime + 10))
                this.world.destroyObject(this);
        }
    }

    export function destroyObjectToFragments(which: GameObject) {
        var HOW_MANY_FRAGMENTS = 6;
        var DIRECTION_STEP = 2 * Math.PI / HOW_MANY_FRAGMENTS;
        var paths = new Array();
        var world = which.world;
        for (var i = 0; i < HOW_MANY_FRAGMENTS; i++) {
            var fragmentPath = new Array();
            var step = { x: 0, y: 0 };
            var direction = i * DIRECTION_STEP;
            while (Math.abs(step.x) < (which.sprite.width / 2) && Math.abs(step.y) < (which.sprite.height / 2)) {
                var stepLength = randomFromRange(1,4);
                step.x += Math.cos(direction) * stepLength;
                step.y += Math.sin(direction) * stepLength;
                fragmentPath.push(step);
                direction = i*DIRECTION_STEP + randomFromRange(-DIRECTION_STEP, DIRECTION_STEP);
            }
            paths.push(fragmentPath);
        }

        for (var i = 0; i < HOW_MANY_FRAGMENTS; i++) {
            var mask = new PIXI.Graphics();
            mask.beginFill(0xFFFFFF, 1);
            mask.moveTo(0, 0);
            var firstPath = paths[i];
            var secondPath = paths[(i + 1) % HOW_MANY_FRAGMENTS];
            for (var j = 0; j < firstPath.length; j++)
                mask.lineTo(firstPath[j].x, firstPath[j].y);
            for (var j = secondPath.length - 1; j >= 0; j--)
                mask.lineTo(secondPath[j].x, secondPath[j].y);
            // create ObjectFragment
            var fragmentSprite = new PIXI.Sprite(which.sprite.texture);
            fragmentSprite.rotation = which.sprite.rotation;
            fragmentSprite.mask = mask;
            fragmentSprite.addChild(mask);

            var fragmentVelocity = which.getVelocity().clone();
            var fragmentRotation;
            fragmentVelocity.length *= 1.25;
            if (i < 3)
                fragmentRotation = i * Math.PI / 32;
            else {
                fragmentRotation = -(i - 3) * Math.PI / 32;
                fragmentVelocity.length *= 0.75;
            }
            fragmentVelocity.rotate(fragmentRotation);
            var fragment = new ObjectFragment(
                world,
                which.getPosition().clone(),
                fragmentVelocity,
                fragmentSprite);
            fragment.rotate(-fragmentRotation);
            world.objects.push(fragment);
        }
    }
} 