module Resources {
    var objects: any[];
    export var progress: number;
    export var progressMax: number;

    export var onload = () => { };
    export var onprogress = (progress: number, progressMax: number, resourceName: string) => { };

    function postloadAction() {
        progress++;
        onprogress(progress, progressMax, this.resourceName);
        if (progress == progressMax)
            onload();
    }

    export function getObject(name: string) {
        return (objects[name] ? objects[name] : undefined);
    }
    export function textureLoader(name: string, file: string) {
        var texture: PIXI.Texture = PIXI.Texture.fromImage(file);
        objects[name] = texture;
        if (!texture.baseTexture.hasLoaded)
            texture.baseTexture.addEventListener("loaded", postloadAction.bind({ resourceName: file }));
        else
            postloadAction.call({ resourceName: file });
    }
    export function dataLoader(name: string, file: string) {
        var jsonLoader: any = new PIXI.JsonLoader(file+"?"+scriptVersion);
        jsonLoader.on('loaded', (evt) => {
            objects[name] = evt.content.json;
            postloadAction.call({ resourceName: file });
        });
        jsonLoader.load();
    }
    function translateResources(resourcesList: ResourceGroup[]): ResourceElement[] {
        var resources: ResourceElement[] = new Array();
        for (var resourceGroupName in resourcesList) {
            var resourceGroup = resourcesList[resourceGroupName];
            if (resourceGroup.file)
                resources.push({
                    name: resourceGroupName,
                    type: resourceGroup.type,
                    file: resourceGroup.file
                });
            else {
                for (var group = 1; group <= resourceGroup.groups; group++) {
                    if (resourceGroup.subgroups) {
                        for (var subgroup = 0; subgroup < resourceGroup.subgroups; subgroup++) {
                            var resourceElement: ResourceElement =
                                {
                                    name: resourceGroupName,
                                    type: resourceGroup.type,
                                    file: resourceGroup.path + "/" + resourceGroup.fileGroup
                                }
                            resourceElement.file += group + "_" + subgroup + "." + resourceGroup.extension;
                            resourceElement.name += group + "" + subgroup;
                            resources.push(resourceElement);
                        }
                    } else {
                        var resourceElement: ResourceElement =
                            {
                                name: resourceGroupName,
                                type: resourceGroup.type,
                                file: resourceGroup.path + "/" + resourceGroup.fileGroup
                            }
                        resourceElement.file += group + "_0." + resourceGroup.extension;
                        resourceElement.name += group;
                        resources.push(resourceElement);
                    }
                }
            }
        }
        return resources;
    }
    export function loadResources(resfile: string) {
        var jsonLoader: any = new PIXI.JsonLoader(resfile);
        objects = new Array();
        jsonLoader.on('loaded', (evt) => {
            var data = evt.content.json;
            var resources: ResourceElement[] = translateResources(data.resources);
            Resources.progress = 0;
            Resources.progressMax = resources.length;
            for (var e in resources)
                switch (resources[e].type) {
                    case "texture":
                        textureLoader(resources[e].name, resources[e].file);
                        break;
                    case "sound":
                        break;
                    case "data":
                        dataLoader(resources[e].name, resources[e].file);
                        break;
                    default:
                        throw new Error("Error: Unknown resource type '"+resources[e].type+"'");
                }
        });
        jsonLoader.load();
    }

    interface ResourceElement {
        name: string;
        type: string;
        file: string;
    }
    interface ResourceGroup {
        type: string;
        file?: string;
        path?: string;
        fileGroup?: string;
        extension?: string;
        groups?: number;
        subgroups?: number;
    }
}

declare class SkillData {
    name: string;
    levelData: SkillLevelInformation[];
}
declare class SkillLevelInformation {
    value: number;
    description: string;
    cost: SkillCrystalRequirements;
    skillRequirements: SkillRequirements[];
}
declare class SkillCrystalRequirements {
    red: number;
    green: number;
    yellow: number;
    blue: number;
}
declare class SkillRequirements {
    skill: string;
    requiredLevel: number;
}

declare class Mission {
    numberDescription: string;
    majorTitle: string;
    minorTitle: string;
    description: string;
    introData: MissionIntro[];
    width: number;
    height: number;
    playerPosition: IPoint;
    target: string;
    objects: MissionObject[];
}
declare class MissionIntro {
    focusOn: string;
    description: string;
    duration: number;
}
declare class MissionObject {
    model: string;
    position: IPoint;
    velocity: IVector;
    objectName: string;
}