/// <reference path="_references.ts" />

// Asteroids v1.0.0
// Paweł Srokosz (C) 2014

// Before release: search for these code annotations
// DEBUG - temporary bunch of code written for debug purpose. Must be deleted or modified before release
// TODO  - uncompleted part of program, which requires progress in other modules and will be finished later
// DEPRECATED - code which will be useless after further modifications. Must be deleted or modified before release.

declare var scriptVersion: string;

module App {
    export module DebugPresets {
        export var ShowObjectRadius: boolean = false;
        export var FocusOnAttacker: boolean = false;
        export var DisableFramerateLimit: boolean = false;
    }

    var viewManager: Layout.ViewManager;
    export function start() {
        viewManager = Layout.ViewManager.getInstance();
        viewManager.registerView("loader", new Layout.LoaderView());
        viewManager.switchView("loader");
        Resources.onprogress = (progress: number, progressMax: number, resourceName: string) => {
            var view = <Layout.LoaderView>viewManager.getView("loader");
            view.setProgress(progress, progressMax);
            view.setStatusText(resourceName);
        }
        Resources.onload = () => {
            viewManager.registerView("start", new Layout.StartView());
            viewManager.registerView("main", new Layout.MainView());
            viewManager.registerView("game", new Layout.GameView());
            viewManager.switchView("start");
        }
        Resources.loadResources("Data/Resources.json?" + scriptVersion);
    }
}

window.onload = () => {
    App.start();
};