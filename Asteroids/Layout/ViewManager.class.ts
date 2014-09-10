module Layout {
    export class ViewManager {
        private static instance: ViewManager = null;
        private views: View[] = new Array();
        private currentView: View = null;
        renderer: PIXI.IPixiRenderer;

        private ratio: number = 1;
        private defaultWidth: number = 600;
        private defaultHeight: number = 600;
        private width: number;
        private height: number;

        constructor() {
            if (ViewManager.instance) {
                throw new Error("Error: ViewManager is a singleton. Instantiation failed");
            }
            this.renderer = PIXI.autoDetectRenderer(this.defaultWidth, this.defaultHeight);
            this.width = this.defaultWidth;
            this.height = this.defaultHeight;
            document.body.appendChild(this.renderer.view);
            this.renderer.view.style.position = "absolute";
            this.rescale();
            window.addEventListener("resize", this.rescale.bind(this), false);
            requestAnimationFrame(this.update);
            ViewManager.instance = this;
            return this;
        }

        static getInstance():ViewManager {
            if (ViewManager.instance === null)
                ViewManager.instance = new ViewManager();
            return ViewManager.instance;
        }

        update() {
            requestAnimationFrame(function () { this.update() }.bind(ViewManager.getInstance()));
            if (!this.currentView || this.currentView.isPaused())
                return;
            this.currentView.update();
            this.applyRatio(this.currentView, this.ratio);
            this.renderer.render(this.currentView);
            this.applyRatio(this.currentView, 1/this.ratio);
        }

        registerView(name: string, view: View):View {
            if (this.views[name])
                return this.views[name];
            this.views[name] = view;
            return view;
        }

        switchView(name: string): View {
            if (this.views[name]) {
                if (this.currentView)
                    this.currentView.pause();
                this.currentView = this.views[name];
                this.currentView.resume();
                return this.currentView;
            } else
                return undefined;
        }

        getView(name: string): View {
            if (this.views[name])
                return this.views[name];
            else
                return undefined;
        }

        private rescale() {
            this.ratio = Math.min(window.innerWidth / this.defaultWidth, window.innerHeight / this.defaultHeight);
            this.width = this.defaultWidth * this.ratio;
            this.height = this.defaultHeight * this.ratio;
            this.renderer.resize(this.width, this.height);
            this.renderer.view.style.left = window.innerWidth / 2 - this.width / 2 + "px";
            this.renderer.view.style.top = window.innerHeight / 2 - this.height / 2 + "px";

        }

        private applyRatio(displayObject: PIXI.DisplayObjectContainer, ratio: number) {
            if (ratio == 1) return;
            displayObject.position.x *= ratio;
            displayObject.position.y *= ratio;
            displayObject.scale.x *= ratio;
            displayObject.scale.y *= ratio;

            for (var i = 0; i < displayObject.children.length; ++i)
                this.applyRatio(<PIXI.DisplayObjectContainer>displayObject.children[i], ratio);
        }
    }
} 