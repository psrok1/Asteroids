module Objects {
    var models = {
        basicAsteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 1,
            crystalsMaxAmount: 5,
            crystalsMaxType: 3
        }),
        basicHarderAsteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 4,
            crystalsMaxAmount: 8,
            crystalsMaxType: 3
        }),
        asteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 3,
            crystalsMaxAmount: 8,
            crystalsMaxType: 4
        }),
        harderAsteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 6,
            crystalsMaxAmount: 12,
            crystalsMaxType: 4
        }),
        hardestAsteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 12,
            crystalsMaxAmount: 15,
            crystalsMaxType: 5
        }),
        chipAsteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 20,
            chipping: true,
            hitsToChip: 5,
            crystalsMaxAmount: 15,
            crystalsMaxType: 5
        }),
        crystalAsteroid: objectModel.bind(CrystalAsteroid, {
            hitsToGo: 12,
            crystalsMaxAmount: 12,
            crystalsMaxType: 5
        }),
        chipHarderAsteroid: objectModel.bind(StandardAsteroid, {
            hitsToGo: 30,
            chipping: true,
            hitsToChip: 6,
            crystalsMaxAmount: 25,
            crystalsMaxType: 5
        }),
        crystalHarderAsteroid: objectModel.bind(CrystalAsteroid, {
            hitsToGo: 25,
            crystalsMaxAmount: 25,
            crystalsMaxType: 5
        }),
        thief: objectModel.bind(ThiefShip, {
            propagateAttack: true,
            reward: 20
        }),
        frightenedThief: objectModel.bind(ThiefShip, {
            avoidPlayerAfterAttack: true,
            reward: 30
        }),
        trapThief: objectModel.bind(ThiefShip, {
            avoidPlayerBeforeAttack: true,
            followPlayerAfterAttack: true,
            attackPlayerAfterAttack: true,
            propagateAttack: true,
            reward: 60
        }),
        helperThief: objectModel.bind(ThiefShip, {
            attackPlayer: true,
            explosiveRockets: true,
            reward: 45
        }),
        soldierThief: objectModel.bind(ThiefShip, {
            followPlayer: true,
            attackPlayer: true,
            explosiveRockets: true,
            reward: 75
        }),
        soldier: objectModel.bind(SoldierShip, {
            reward: 80
        }),
        armedSoldier: objectModel.bind(SoldierShip, {
            EMPClassRockets: true,
            reward: 90
        }),
        invulnerableHeavySoldier: objectModel.bind(SoldierShip, {
            heavyBattleship: true,
            ignorePlayer: true,
            invulnerable: true
        }),
        heavySoldier: objectModel.bind(SoldierShip, {
            heavyBattleship: true,
            EMPClassRockets: true,
            reward: 150
        }),
        spawnArmedSoldier: objectModel.bind(SoldierShip, {
            spawn: true,
            EMPClassRockets: true,
            reward: 45
        }),
        kamikazeSoldier: objectModel.bind(SoldierShip, {
            kamikazeMode: true,
            reward: 150
        }),
        support: objectModel.bind(SupportShip, {}),
        clockBombSupport: objectModel.bind(SupportShip, { /*TODO*/ }),
        spy: objectModel.bind(SupportShip, { /*TODO*/ }),
        pseudoSupport: objectModel.bind(SupportShip, {
            playerAttacker: true,
            reward: 180
        }),
        timeInvulnerable: objectModel.bind(InvulnerableShip, { 
            reward: 200
        }),
        crystalInvulnerable: objectModel.bind(InvulnerableShip, {
            crystalInvulnerable: true,
            reward: 200
        })
    };

    function objectModel(settings: any, world: World, position: Point, velocity: Vector): GameObject {
        return new this(world, position, velocity, settings);
    }

    export function createObjectFromModel(model: string, world: World, position: Point, velocity: Vector): GameObject {
        if(!models[model])
            throw new Error("Error: World.createObject failed. Unknown model of object '" + model + "'");
        return models[model](world, position, velocity);
    }
} 