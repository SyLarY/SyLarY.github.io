(function(window) {

    window.game = window.game || {}

    function SpacePatrol() {
        this.initialize();
    }

    var p = SpacePatrol.prototype;

    p.preloader;

    p.currentGameStateFunction;
    p.currentScene;

    game.gScore = 0;
    game.gNextBossShip = 0;
    game.gNumLives = 5;
    game.gLevel = 1;


    p.initialize = function() {
        // set globals
        canvas = document.getElementById('canvas');
        stage = new createjs.Stage(canvas);
        screen_width = canvas.width;
        screen_height = canvas.height;
        // end globals
        createjs.Touch.enable(stage);
        stage.enableMouseOver();
        game.assets = new game.AssetManager();
        this.preloadAssets()
    }
    p.preloadAssets = function() {
        this.preloader = new ui.Preloader('#66ff66', '#FFF');
        this.preloader.x = (canvas.width / 2) - (this.preloader.width / 2);
        this.preloader.y = (canvas.height / 2) - (this.preloader.height / 2);
        stage.addChild(this.preloader);
        game.assets.on(game.assets.ASSETS_PROGRESS, this.onAssetsProgress, this);
        game.assets.on(game.assets.ASSETS_COMPLETE, this.assetsReady, this);
        game.assets.preloadAssets();
    }
    p.onAssetsProgress = function() {
        this.preloader.update(game.assets.loadProgress);
        stage.update();
    }
    p.assetsReady = function() {
        stage.removeChild(this.preloader);
        stage.update();
        this.createSpriteSheet();
        this.gameReady();
    }
    p.createSpriteSheet = function() {
        var assets = game.assets;
        spritesheet = new createjs.SpriteSheet(assets.getAsset(assets.GAME_SPRITES_DATA));
    }
    p.gameReady = function() {
        createjs.Ticker.setFPS(60);
        createjs.Ticker.on("tick", this.onTick, this);
        this.changeState(game.GameStates.MAIN_MENU);
    }
    p.changeState = function(state) {
        switch (state) {
            case game.GameStates.MAIN_MENU:
                this.currentGameStateFunction = this.gameStateMainMenu;
                break;
            case game.GameStates.GAME:
                this.currentGameStateFunction = this.gameStateGame;
                break;
            case game.GameStates.RUN_SCENE:
                this.currentGameStateFunction = this.gameStateRunScene;
                break;
            case game.GameStates.GAME_OVER:
                this.currentGameStateFunction = this.gameStateGameOver;
                break;
            case game.GameStates.GAME_WIN:
                this.currentGameStateFunction = this.gameStateGameWin;
                break;
            case game.GameStates.GAME_TRANSITION_1:
                this.currentGameStateFunction = this.gameStateGameTransition1;
                break;
            case game.GameStates.GAME_TRANSITION_2:
                this.currentGameStateFunction = this.gameStateGameTransition2;
                break;
       }
    }
    p.onStateEvent = function(e, obj) {
        this.changeState(obj.state);
    }
    p.disposeCurrentScene = function() {
        if (this.currentScene != null) {
            stage.removeChild(this.currentScene);
            if (this.currentScene.dispose) {
                // this.currentScene.dispose();
            }
            this.currentScene = null;
        }
    }
    p.gameStateMainMenu = function(tickEvent) {
        var scene = new game.GameMenu();
        scene.on(game.GameStateEvents.GAME, this.onStateEvent, this, true, { state: game.GameStates.GAME });
        stage.addChild(scene);
        this.disposeCurrentScene();
        this.currentScene = scene;
        this.changeState(game.GameStates.RUN_SCENE);
    }

    p.gameStateGame = function(tickEvent) {
        var scene = new game.Game();
        scene.on(game.GameStateEvents.GAME_WIN, this.onStateEvent, this, true, { state: game.GameStates.GAME_WIN });
        scene.on(game.GameStateEvents.GAME_OVER, this.onStateEvent, this, true, { state: game.GameStates.GAME_OVER });
        scene.on(game.GameStateEvents.GAME_TRANSITION_1, this.onStateEvent, this, true, { state: game.GameStates.GAME_TRANSITION_1 });
        scene.on(game.GameStateEvents.GAME_TRANSITION_2, this.onStateEvent, this, true, { state: game.GameStates.GAME_TRANSITION_2 });
        stage.addChild(scene);
        this.disposeCurrentScene()
        this.currentScene = scene;
        this.changeState(game.GameStates.RUN_SCENE);
    }
    p.gameStateGameOver = function(tickEvent) {
        createjs.Sound.stop();
        var scene = new game.GameOver();
        stage.addChild(scene);
        scene.on(game.GameStateEvents.MAIN_MENU, this.onStateEvent, this, true, { state: game.GameStates.MAIN_MENU });
        scene.on(game.GameStateEvents.GAME, this.onStateEvent, this, true, { state: game.GameStates.GAME });
        this.disposeCurrentScene();
        this.currentScene = scene;
        this.changeState(game.GameStates.RUN_SCENE);
    }
    p.gameStateGameWin = function(tickEvent) {
        var scene = new game.GameWin();
        scene.on(game.GameStateEvents.MAIN_MENU, this.onStateEvent, this, true, { state: game.GameStates.MAIN_MENU });
        scene.on(game.GameStateEvents.GAME, this.onStateEvent, this, true, { state: game.GameStates.GAME });
        stage.addChild(scene);
        this.disposeCurrentScene();
        this.currentScene = scene;
        this.changeState(game.GameStates.RUN_SCENE);
    }
    p.gameStateGameTransition1 = function(tickEvent) {
        var scene = new game.GameTransition1();
        scene.on(game.GameStateEvents.MAIN_MENU, this.onStateEvent, this, true, { state: game.GameStates.MAIN_MENU });
        scene.on(game.GameStateEvents.GAME, this.onStateEvent, this, true, { state: game.GameStates.GAME });
        stage.addChild(scene);
        this.disposeCurrentScene();
        this.currentScene = scene;
        this.changeState(game.GameStates.RUN_SCENE);
    }
    p.gameStateGameTransition2 = function(tickEvent) {
        var scene = new game.GameTransition2();
        scene.on(game.GameStateEvents.MAIN_MENU, this.onStateEvent, this, true, { state: game.GameStates.MAIN_MENU });
        scene.on(game.GameStateEvents.GAME, this.onStateEvent, this, true, { state: game.GameStates.GAME });
        stage.addChild(scene);
        this.disposeCurrentScene();
        this.currentScene = scene;
        this.changeState(game.GameStates.RUN_SCENE);
    }
    p.gameStateRunScene = function(tickEvent) {
        if (this.currentScene.run) {
            this.currentScene.run(tickEvent);
        }
    }
    p.onTick = function(e) {
        if (this.currentGameStateFunction != null) {
            this.currentGameStateFunction(e);
        }
        stage.update();
    }

    window.game.SpacePatrol = SpacePatrol;

}(window));