interface IVector {
    x: number;
    y: number;
}
class Vector implements IVector {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    add(vec: Vector) {
        this.x += vec.x;
        this.y += vec.y;
    }
    sub(vec: Vector) {
        this.x -= vec.x;
        this.y -= vec.y;
    }
    scale(m: number) {
        this.x *= m;
        this.y *= m;
    }
    scalarProduct(vec: Vector): number {
        return this.x * vec.x + this.y * vec.y;
    }
    crossProductMagnitude(vec: Vector): number {
        return this.x * vec.y - this.y * vec.x;
    }
    signOfSumRotation(vec: Vector): number {
        return (this.crossProductMagnitude(vec) > 0 ? 1 : -1);
    }
    angleToVector(vec: Vector): number {        
        var direction = Math.acos(this.scalarProduct(vec) / (this.length * vec.length));
        return this.signOfSumRotation(vec) * direction;
    }
    get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set length(len: number) {
        if (len == 0)
            this.x = this.y = 0;
        else {
            var scale: number = len / this.length ;
            this.scale(scale);
        }
    }
    get rotation(): number {
        return Math.atan2(this.y, this.x);
    }
    set rotation(angle: number) {
        var len: number = this.length;
        this.x = len * Math.cos(angle);
        this.y = len * Math.sin(angle);
    }
    rotate(angle: number) {
        var x: number = this.x;
        var y: number = this.y;
        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) + y * Math.cos(angle);
    }
    clone(): Vector {
        return new Vector(this.x, this.y);
    }
    assign(vec: Vector) {
        this.x = vec.x;
        this.y = vec.y;
    }
}

class PolarVector extends Vector {
    constructor(angle: number = 0, length: number = 0) {
        super(length * Math.cos(angle), length * Math.sin(angle));
    }
}

interface IPoint {
    x: number;
    y: number;
}
class Point implements IPoint {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    move(vec: Vector) {
        this.x += vec.x;
        this.y += vec.y;
    }
    clone(): Point {
        return new Point(this.x, this.y);
    }
    getPositionVector(): Vector {
        return new Vector(this.x, this.y);
    }
}

class TorusPoint extends Point {
    torusWidth: number;
    torusHeight: number;

    constructor(x: number= 0, y: number = 0, width: number = 0, height: number = 0) {
        super(x, y);
        this.torusWidth = width;
        this.torusHeight = height;
        this.normalize();
    }
    private normalize() {
        this.x = (this.x + this.torusWidth * 1.5) % this.torusWidth - this.torusWidth / 2;
        this.y = (this.y + this.torusHeight * 1.5) % this.torusHeight - this.torusHeight / 2;
    }
    move(vec: Vector) {
        this.x += vec.x;
        this.y += vec.y;
        this.normalize();
    }
    getRelative(reference: Point): RelativeTorusPoint {
        return new RelativeTorusPoint(this, reference);
    }
    clone(): TorusPoint {
        return new TorusPoint(this.x, this.y, this.torusWidth, this.torusHeight);
    }
}

class RelativeTorusPoint extends TorusPoint {
    referencePoint: Point;

    constructor(point: TorusPoint, reference: Point) {
        super(point.x - reference.x, point.y - reference.y,
            point.torusWidth, point.torusHeight);
        this.referencePoint = reference;
    }
    getAbsolute(): TorusPoint {
        return new TorusPoint(
            this.x + this.referencePoint.x,
            this.y + this.referencePoint.y,
            this.torusWidth, this.torusHeight);
    }
}

function rayIntersectsObject(rayStart: IPoint, rayVector: Vector,
                             position: IPoint, radius: number): boolean {
    var d: Vector = rayVector;
    var f: Vector = new Vector(rayStart.x - position.x, rayStart.y - position.y);

    var a: number = d.scalarProduct(d);
    var b: number = 2 * f.scalarProduct(d);
    var c: number = f.scalarProduct(f) - radius * radius;
    var delta: number = b * b - 4 * a * c;
    if (delta >= 0) {
        delta = Math.sqrt(delta);
        var t1: number = (-b - delta) / (2 * a);
        var t2: number = (-b + delta) / (2 * a);
        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1))
            return true;
    }
    return false;
}
function randomFromRange(from: number, to: number) {
    return Math.random() * (to - from) + from;
}