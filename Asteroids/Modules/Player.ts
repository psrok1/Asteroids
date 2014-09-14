module Player {
    var playerData: Data;
    var dataID: string = "asteroidsPlayer";

    export function existInStorage(): boolean {
        return localStorage.getItem(dataID) !== null;
    }
    export function create(name: string) {
        var ZeroArray = (size: number): number[]=> {
            return Array.apply(null, new Array(size)).map(Number.prototype.valueOf, 0);
        };
        playerData = {
            name: name,
            currentMission: 1,
            skillsLevel: ZeroArray(16),
            crystalsAmount: ZeroArray(4),            
            rocketsStorage: [-1, -1],
            rocketsAmount: [0, 0]
        };
        save();
    }
    export function save() {
        localStorage.setItem(dataID, JSON.stringify(playerData));
    }
    export function load() {
        var storagedData: string = localStorage.getItem(dataID);
        playerData = JSON.parse(storagedData);
    }

    export function getName(): string { return playerData.name; }
    export function getCurrentMission(): Mission { return Resources.getObject("mission" + playerData.currentMission); }
    export function nextMission() {
        playerData.currentMission++; save();
    }
    export function getSkillLevel(which: number): number {
        return playerData.skillsLevel[which];
    }
    export function rocketSkillLevel(): number {
        return getSkillLevel(3);
    }
    function getSkillIdByName(name: string): number {
        var skillData: SkillData[] = Resources.getObject("skillsData").skills;
        for (var i = 0; i < 16; i++)
            if (skillData[i].name == name)
                return i;
        return -1;
    }
    export function checkSkillRequirements(which: number): boolean {
        var skillData: SkillData = Resources.getObject("skillsData").skills[which];
        var skillCrystalRequirements = skillData.levelData[playerData.skillsLevel[which]].cost;
        var skillOtherRequirements = skillData.levelData[playerData.skillsLevel[which]].skillRequirements;
        if (skillCrystalRequirements.red > playerData.crystalsAmount[0])
            return false;
        if (skillCrystalRequirements.green > playerData.crystalsAmount[1])
            return false;
        if (skillCrystalRequirements.yellow > playerData.crystalsAmount[2])
            return false;
        if (skillCrystalRequirements.blue > playerData.crystalsAmount[3])
            return false;
        for (var i = 0; i < skillOtherRequirements.length; i++) {
            var skillID = getSkillIdByName(skillOtherRequirements[i].skill);
            if (skillID == -1)
                throw new Error("Error: Skill with name '" + skillOtherRequirements[i].skill + "' doesn't exist");
            if (playerData.skillsLevel[skillID] < skillOtherRequirements[i].requiredLevel)
                return false;
        }
        return true;
    }

    export function increaseSkillLevel(which: number) {
        if (playerData.skillsLevel[which] === 3 || !checkSkillRequirements(which))
            return;
        var skillData: SkillData = Resources.getObject("skillsData").skills[which];
        var skillCrystalRequirements = skillData.levelData[playerData.skillsLevel[which]].cost;
        setCrystalAmount(0, getCrystalAmount(0) - skillCrystalRequirements.red);
        setCrystalAmount(1, getCrystalAmount(1) - skillCrystalRequirements.green);
        setCrystalAmount(2, getCrystalAmount(2) - skillCrystalRequirements.yellow);
        setCrystalAmount(3, getCrystalAmount(3) - skillCrystalRequirements.blue);
        playerData.skillsLevel[which]++;
        save();
    }

    export function getCrystalAmount(which: number) {
        return playerData.crystalsAmount[which];
    }
    export function setCrystalAmount(which: number, amount: number) {
        playerData.crystalsAmount[which] = amount;
        save();
    }

    export function getRocketSlot(which: number): RocketSlot {
        return {
            type: playerData.rocketsStorage[which],
            amount: playerData.rocketsAmount[which]
        };
    }

    export function loadRocketSlot(which: number, type: number) {
        var amountArray: number[];
        switch (rocketSkillLevel()) {
            case 0:
                amountArray = [0, 0, 0, 0, 0, 0];
                break;
            case 1:
                amountArray = [1, 1, 0, 0, 0, 0];
                break;
            case 2:
                amountArray = [2, 1, 1, 1, 0, 0];
                break;
            case 3:
                amountArray = [3, 2, 1, 1, 1, 1];
                break;
        }
        playerData.rocketsStorage[which] = type;
        playerData.rocketsAmount[which] = amountArray[type];
        save();
    }

    export interface RocketSlot {
        type: number;
        amount: number;
    }

    export interface Data {
        name: string;
        currentMission: number;
        skillsLevel: number[];
        crystalsAmount: number[];
        rocketsStorage: number[];
        rocketsAmount: number[];
    }
} 