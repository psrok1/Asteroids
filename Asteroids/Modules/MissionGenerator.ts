module MissionGenerator {
    export var worldDimension = {
        width: 2000,
        height: 2000
    };
    export var modelList: Model[] = new Array();
    export var missionObjects: MissionObject[] = new Array();

    export function setWorldDimension(width: number, height: number) {
        worldDimension.width = width;
        worldDimension.height = height;
    }

    export function pushModel(name: string, radius: number, velocity: number, amount: number) {
        modelList.push({
            name: name,
            radius: radius,
            velocity: velocity,
            amount: amount
        });
    }

    function getRandomPosition(): TorusPoint {
        var x = randomFromRange(-worldDimension.width / 2, worldDimension.width / 2 - 600);
        if (x > -300)
            x += 600;
        var y = randomFromRange(-worldDimension.height / 2, worldDimension.height / 2 - 600);
        if (y > -300)
            y += 600;
        return new TorusPoint(x, y, worldDimension.width, worldDimension.height);
    }

    function checkDistance(first: TorusPoint, second: IPoint): boolean {
        var posVector = first.getRelative(new Point(second.x, second.y)).getPositionVector();
        return posVector.length > 300;
    }

    function getRandomVelocity(maxVelocity: number): Vector {
        return new PolarVector(randomFromRange(-Math.PI, Math.PI), maxVelocity);
    }

    function checkPosition(pos: TorusPoint): boolean {
        for (var i = 0; i < missionObjects.length; i++)
            if (!checkDistance(pos, missionObjects[i].position))
                return false;
        return true;
    }

    function findObjectRadius(obj: MissionObject): number {
        for (var i = 0; i < modelList.length; i++)
            if (modelList[i].name === obj.model)
                return modelList[i].radius;
        return -1;
    }

    function nearestDistance(pos: TorusPoint, vel: Vector): number {
        var nearest: number = null;
        for (var i = 0; i < missionObjects.length; i++) {
            var objPosition = new Point(missionObjects[i].position.x, missionObjects[i].position.y);
            var posVector = pos.getRelative(objPosition).getPositionVector();
            var radius = findObjectRadius(missionObjects[i]);
            if (radius < 0)
                throw new Error("Error: Model '"+missionObjects[i].model+"' isn't pushed to generator.");
            if (rayIntersectsObject({ x: 0, y: 0 }, vel, objPosition, radius))
                if (nearest === null || nearest > posVector.length)
                    nearest = posVector.length;
        }
        return nearest;
    }

    function pushObjectFromModel(model: Model): boolean {
        var position: TorusPoint;
        var velocity: Vector;
        var tryCounter = 0;
        while (tryCounter < 50) {
            position = getRandomPosition();
            if (checkPosition(position))
                break;
            tryCounter++;
        }
        if (tryCounter >= 50)
            return false;
        var nearest: number = null;
        for (var i = 0; i < 50; i++) {
            var vel = getRandomVelocity(model.velocity);
            var nDist = nearestDistance(position, vel);
            if (nDist === null) {
                velocity = vel;
                break;
            }
            if (nearest === null || nDist < nearest) {
                nearest = nDist;
                velocity = vel;
            }
        }
        missionObjects.push({
            model: model.name,
            position: { x: Math.round(position.x), y: Math.round(position.y) },
            velocity: { x: Math.round(velocity.x*1000)/1000, y: Math.round(velocity.y*1000)/1000 }
        });
        return true;
    }

    export function createMission(): string {
        var mission: Mission = {
            numberDescription: "",
            majorTitle: "",
            minorTitle: "",
            introData: [],
            width: worldDimension.width,
            height: worldDimension.height,
            playerPosition: { x: 0, y: 0 },
            target: "",
            objects: []
        }
        missionObjects = new Array();
        for (var i = 0; i < modelList.length; i++) {
            for (var j = 0; j < modelList[i].amount; j++)
                if (!pushObjectFromModel(modelList[i])) {
                    worldDimension.height += 300;
                    worldDimension.width += 300;
                    return createMission();
                }
        }
        for (var i = 0; i < missionObjects.length; i++)
            mission.objects.push(missionObjects[i]);
        return JSON.stringify(mission);
    }

    export interface Model {
        name: string;
        radius: number;
        velocity: number;
        amount: number;
    }
} 