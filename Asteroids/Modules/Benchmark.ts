module Benchmark {
    var lastFrameTime: any = new Date();
    var renderClock: any = new Date();
    var preprocessingClock: any = new Date();
    var delayedFrames: number = 0;
    var fps: number = 0;
    var trnd: number = 0;
    var tpre: number = 0;
    var obj: number = 0;
    var benchmarkClock: number = 0;

    export function frameTick() {
        var now: any = new Date();
        var delta = now - lastFrameTime;
        fps = Math.floor(1000 / delta);
        lastFrameTime = now;
    }

    export function startRender() {
        renderClock = new Date();
    }

    export function stopRender() {
        var now: any = new Date();
        var delta = now - renderClock;
        trnd = delta;
    }

    export function startPreprocessing() {
        preprocessingClock = new Date();
    }

    export function stopPreprocessing() {
        var now: any = new Date();
        var delta = now - preprocessingClock;
        tpre = delta;
    }

    export function delayedFrameTick() {
        delayedFrames++;
    }

    export function setObjectCounter(objects: number) {
        obj = objects;
    }

    export function update() {
        if (App.DebugPresets.EnableBenchmark && benchmarkClock++ > 10) {
            benchmarkClock = 0;
            document.getElementById("bFPS").innerHTML = fps.toString();
            document.getElementById("bDLF").innerHTML = delayedFrames.toString();
            document.getElementById("bOBJ").innerHTML = obj.toString();
            document.getElementById("bTRND").innerHTML = trnd.toString();
            document.getElementById("bTPRE").innerHTML = tpre.toString();
        }
    }
}
 