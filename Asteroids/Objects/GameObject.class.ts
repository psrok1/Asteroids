module Objects {
    export class GameObject {
        name: string;
        world: World;
        renderObject: PIXI.Sprite;
        sprite: PIXI.Sprite;

        destroyed: boolean = false;

        armor: number = Infinity;
        armorMaximum: number = Infinity;
        invulnerable: boolean = false;

        private position: TorusPoint;
        private velocity: Vector;
        private radius: number;
        private rotation: number;
        private maxVelocity: number;
        private armorBar: PIXI.Graphics;
        private armorBarHide: number = 0;

        private effects: GameObjectEffect[] = new Array();

        constructor(world: World,
            sprite: PIXI.Sprite,
            position: Point,
            velocity: Vector,
            radius: number,
            maxVelocity: number) {
            var renderObjectTexture = new PIXI.Graphics();
            renderObjectTexture.beginFill(0xFFFFFF, 0)
            renderObjectTexture.drawRect(0, 0, 1, 1);
            renderObjectTexture.endFill();

            this.name = null;
            this.world = world;
            this.sprite = sprite;
            this.sprite.anchor = new PIXI.Point(0.5, 0.5);
            this.renderObject = new PIXI.Sprite((<any>renderObjectTexture).generateTexture(false));
            this.renderObject.anchor = new PIXI.Point(0.5, 0.5);
            this.renderObject.addChild(this.sprite);
            if (App.DebugPresets.ShowObjectRadius) {
                var debugGraphics = new PIXI.Graphics();
                debugGraphics.lineStyle(0);
                debugGraphics.beginFill(0xFFFF0B, 0.5);
                debugGraphics.drawCircle(0, 0, radius);
                this.renderObject.addChild(debugGraphics);
            }
            this.position = new TorusPoint(position.x, position.y, world.width, world.height);
            if (velocity.length > maxVelocity)
                velocity.length = maxVelocity;
            this.velocity = velocity.clone();
            this.rotation = velocity.rotation;
            this.radius = radius;
            this.maxVelocity = maxVelocity;
            this.sprite.rotation = this.rotation;

            this.world.view.addChild(this.renderObject);
            this.world.objects.push(this);
        }
        update() {
            this.position.move(this.velocity);
            this.sprite.rotation = (this.rotation ? this.rotation : this.velocity.rotation) - Math.PI / 2;
            for (var i = 0; i < this.effects.length; i++) {
                if (!this.effects[i].update()) {
                    this.effects[i].onDestroy();
                    this.effects.splice(i, 1);
                    i--;
                }
            }
            if (this.armorBarHide !== 0)
                if (this.armorBarHide++ > 60) {
                    this.armorBar.visible = false;
                    this.armorBarHide = 0;
                }
        }
        doExplosion() {
            this.effects.push(new Explosion(this));
        }
        doLightning() {
            this.effects.push(new Lightning(this));
        }
        showArmorBar() {
            if (this.armorBar)
                this.renderObject.removeChild(this.armorBar);
            this.armorBar = new PIXI.Graphics();
            this.armorBar.beginFill(0x800000, 0.3);
            this.armorBar.drawRect(0, 0, this.radius * 2, 4);
            this.armorBar.endFill();
            this.armorBar.beginFill((this.invulnerable ? 0xFFFF00 : 0xFF0000), 0.5);
            this.armorBar.drawRect(0, 0, this.radius * 2 *
                (this.armor === Infinity ? 1 : this.armor / this.armorMaximum), 4);
            this.armorBar.endFill();
            this.armorBar.position = new PIXI.Point(-this.radius, -this.radius - 8);
            this.renderObject.addChild(this.armorBar);
            this.armorBarHide = 1;
        }
        applyForce(force: Vector) {
            this.velocity.add(force);
            if (this.velocity.length > this.maxVelocity)
                this.velocity.length = this.maxVelocity;
        }
        applyCameraPosition(camera: Point) {
            var relPosition: RelativeTorusPoint = this.position.getRelative(camera);
            this.renderObject.position.x = relPosition.x + 300;
            this.renderObject.position.y = relPosition.y + 300;
        }
        testCollision(which: GameObject) {
            var relPosition: RelativeTorusPoint = which.position.getRelative(this.position);
            var vec: Vector = new Vector(relPosition.x, relPosition.y);
            return vec.length <= (this.radius + which.radius);
        }
        rotate(angle: number) {
            this.rotation += angle;
        }
        onCollide(which: GameObject) { } 
        onDestroy() {
            // TODO: Move removing child from view to World.destroyObject
            this.destroyed = true;
            this.world.view.removeChild(this.renderObject);
        }
        getVelocity(): Vector { return this.velocity; }
        getPosition(): TorusPoint { return this.position; }
        getRadius(): number { return this.radius; }
        getRotation(): number { return (this.rotation === undefined ? this.velocity.rotation : this.rotation); }
        setRotation(rotation: number) {
            this.rotation = rotation;
        }
        attachRotationToVelocity() { this.rotation = undefined; }
    }

    class GameObjectEffect {
        private object: GameObject;
        private resIDBase: string;
        private sprite: PIXI.Sprite;
        private frame: number = 0;
        private frameMax: number;

        private nextFrame() {
            if (this.frame >= this.frameMax)
                return;
            var resID = this.resIDBase + (++this.frame);
            this.sprite.setTexture(Resources.getObject(resID));
        }
        constructor(object: GameObject, resIDBase: string, frames: number) {
            this.object = object;
            this.resIDBase = resIDBase;
            this.frameMax = frames - 1;
            var resID = this.resIDBase + this.frame;
            this.sprite = new PIXI.Sprite(Resources.getObject(resID));
            object.renderObject.addChild(this.sprite);
        }
        onDestroy() {
            this.object.renderObject.removeChild(this.sprite);
        }
        update(): boolean {
            if (this.frame >= this.frameMax)
                return false;
            this.nextFrame();
            return true;
        }
        getSprite(): PIXI.Sprite { return this.sprite; }
    }

    class Explosion extends GameObjectEffect {
        constructor(object: GameObject) {
            super(object, "explosion1", 16);
            var sprite = this.getSprite();
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.position.x = randomFromRange(-object.getRadius(), object.getRadius());
            sprite.position.y = randomFromRange(-object.getRadius(), object.getRadius());
        }
    }
    class Lightning extends GameObjectEffect {
        constructor(object: GameObject) {
            super(object, "lightning1", 10);
            var sprite = this.getSprite();
            sprite.anchor.x = sprite.anchor.y = 0.5;
            sprite.scale.x = sprite.scale.y = object.getRadius() / 95;
        }
    }

    export function evaluateDamage(
        victim: GameObject,
        bullet: GameObject,
        force: number): number {
        var radius = victim.getRadius() + bullet.getRadius();
        var distanceVec: RelativeTorusPoint = victim.getPosition().getRelative(bullet.getPosition());
        var distance: number = Math.sqrt(distanceVec.x * distanceVec.x + distanceVec.y * distanceVec.y);
        var x: number = distance / radius;

        return force * (x <= 0.5 ? 1 : -3.2 * x * x + 3 * x + 0.3);
    }
} 