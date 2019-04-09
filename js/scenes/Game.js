(function(window) {

    window.game = window.game || {}

    function Game() {
        this.initialize();
    }

    var p = Game.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;

    // Hero
    p.heroShip = null;
    p.heroBulletPool = null;
    p.heroMissilePool = null;
    p.heroBullets = null;
    p.heroBulletType = 1;

    // Enemies
    p.enemyPool = null;
    p.enemies = null;
    p.enemyBulletPool = null;
    p.enemyBullets = null;
    p.enemyLastSpawnTime = null;
    p.enemySpawnWaiter = 1000; //2000;

    // Bosses
    p.boss = null;
    p.bossLastSpawnTime = 0;
    p.bossLastSpawnPoints = 0;
    p.bossSpawnWaiter = 200; //400; //10000;
    p.nextBossShip = 0;

    // Meteors
    p.meteorPool = null;
    p.meteor = null;
    p.meteorLastSpawnTime = null;
    p.meteorSpawnWaiter = 700;


    // SPRITES
    p.stars = null;
    p.explosionPool = null;
    p.healthMeter = null;
    p.lifeBox = null;
    p.scoreboard = null;
    p.collectMissile = null;
    p.collectMissileTime = 0;
    p.collectHealthMeterUp = null;
    p.collectHealthMeterUpTime = 0;

    //
    p.leftWall = null;
    p.rightWall = null;
    p.ceiling = null;
    p.floor = null;
    p.betweenLevels = true;
    p.numLives = 5;
    p.delta = null;

    // Controls
    p.leftKeyDown = false;
    p.rightKeyDown = false;
    p.upKeyDown = false;
    p.downKeyDown = false;

    //level
    p.level = 1;
    p.levelup = false;

    //background
    p.bg = null;

    p.initialize = function() {
        this.Container_initialize();
        this.setProperties();
        this.buildBackground();
        this.buildSprites();
        this.setWalls();
        this.setControls();
        createjs.Sound.play(game.assets.SOUNDTRACK, 0, 0, 0, 0, 0.8);
    }
    p.setProperties = function() {
        this.heroBulletPool = [];
        this.heroMissilePool = [];
        this.heroBullets = [];
        this.enemyPool = [];
        this.enemies = [];
        this.enemyBulletPool = [];
        this.enemyBullets = [];
        this.stars = [];
        this.explosionPool = [];
        this.betweenLevels = false;
        this.enemyLastSpawnTime = 0;
        this.bossLastSpawnTime = 0;
        this.meteorPool = [];
        this.meteors = [];
        this.meteorLastSpawnTime = 0;
        this.heroBulletType = 1;
        this.nextBossShip = game.gNextBossShip;
        this.numLives = game.gNumLives;
        this.level = game.gLevel;
        this.bossLastSpawnPoints = game.gScore;
    }
    p.buildBackground = function() {

        var url = "img/bg.jpg";
        this.bg = new createjs.Bitmap(url);
        this.bg.scaleX = 1.25; //scale background to 800px

        this.addChild(this.bg);

        this.bg.y = -10240;

    }
    p.buildSprites = function() {
        this.heroShip = new game.HeroShip();
        this.heroShip.on(this.heroShip.EXPLOSION_COMPLETE, this.checkGame, this);
        this.heroShip.x = screen_width / 2;
        this.heroShip.y = screen_height - this.heroShip.getBounds().height;
        this.heroBulletPool = new game.SpritePool(game.Bullet, 20);
        this.heroMissilePool = new game.SpritePool(game.Missile, 20);
        this.enemyBulletPool = new game.SpritePool(game.Bullet, 50);
        this.enemyPool = new game.SpritePool(game.EnemyShip, 50);
        this.meteorPool = new game.SpritePool(game.Meteor, 10);
        this.explosionPool = new game.SpritePool(game.Explosion, 20);
        this.healthMeter = new game.HealthMeter();
        
        this.scoreboard = new game.Scoreboard(game.gScore);

        this.lifeBox = new game.LifeBox(this.numLives);
        this.addChild(this.heroShip, this.healthMeter, this.scoreboard, this.lifeBox);
        //this.addChild(this.heroShip, this.scoreboard, this.lifeBox);
    }
    p.setWalls = function() {
        this.leftWall = this.heroShip.getBounds().width / 2;
        this.rightWall = screen_width - this.heroShip.getBounds().width / 2;
        this.floor = screen_height - this.heroShip.getBounds().height;
        //this.ceiling = screen_height - (this.heroShip.getBounds().height * 3);
        this.ceiling = screen_height - (this.heroShip.getBounds().height * 13);
    }
    p.setControls = function() {
        document.onkeydown = this.handleKeyDown.bind(this);
        document.onkeyup = this.handleKeyUp.bind(this);

    }
    p.handleKeyDown = function(e) {
        e = !e ? window.event : e;
        switch (e.keyCode) {
            case ARROW_KEY_LEFT:
                this.leftKeyDown = true;
                break;
            case ARROW_KEY_RIGHT:
                this.rightKeyDown = true;
                break;
            case ARROW_KEY_UP:
                this.upKeyDown = true;
                break;
            case ARROW_KEY_DOWN:
                this.downKeyDown = true;
                break;
        }
    }
    p.handleKeyUp = function(e) {
            e = !e ? window.event : e;
            switch (e.keyCode) {
                case ARROW_KEY_LEFT:
                    this.leftKeyDown = false;
                    break;
                case ARROW_KEY_RIGHT:
                    this.rightKeyDown = false;
                    break;
                case ARROW_KEY_SPACE:
                    this.spawnHeroBullet();
                    break;
                case ARROW_KEY_UP:
                    this.upKeyDown = false;
                    break;
                case ARROW_KEY_DOWN:
                    this.downKeyDown = false;
                    break;
            }
        }
        /*
         *
         * UPDATE FUNCTIONS
         *
         */
    p.updateBackground = function() {
        switch (this.level) {
            case 1:
                if (this.bg.y >= -7360) {
                    this.bg.y = -10240;
                }

                break;
            case 2:
                if (this.bg.y <= -6560) {
                    this.bg.y = -6560;
                }
                if (this.bg.y >= -3680) {
                    this.bg.y = -6560;
                }
                break;
            case 3:
                if (this.bg.y <= -2880) {
                    this.bg.y = -2880;
                }
                if (this.bg.y >= 0) {
                    this.bg.y = -2880;
                }
                break;
        }
        this.bg.y += 5;
    }

    p.updateHeroShip = function() {
        var velocity = this.heroShip.speed * this.delta / 1000;
        var nextX = this.heroShip.x;
        var nextY = this.heroShip.y;

        if (this.levelup) {
            this.deleteHeroBullets();
            this.deleteEnemyBullets();
            this.deleteEnemies();
            this.deleteMeteors();
            this.enemyLastSpawnTime += 3000;
            this.meteorLastSpawnTime += 3000;

            this.heroShip.playTransition();
            
            this.deleteEnemyBullets();
            this.deleteEnemyBullets();
            this.resetGame();
            this.levelup = false;
        }

        if (this.leftKeyDown) {
            nextX -= velocity;
            if (nextX < this.leftWall) {
                nextX = this.leftWall;
            }
        } else if (this.rightKeyDown) {
            nextX += velocity;
            if (nextX > this.rightWall) {
                nextX = this.rightWall;
            }
        } else if (this.downKeyDown) {
            nextY += velocity;
            if (nextY > this.floor) {
                nextY = this.floor;
            }
        } else if (this.upKeyDown) {
            nextY -= velocity;
            if (nextY < this.ceiling) {
                nextY = this.ceiling;
            }
        }
        this.heroShip.nextX = nextX;
        this.heroShip.nextY = nextY;
    }
    p.updateMeteors = function() {
        var meteor, i, velY;
        var len = this.meteors.length - 1;
        for (i = len; i >= 0; i--) {
            meteor = this.meteors[i];
            velY = meteor.speed * this.delta / 1000;
            meteor.nextY = meteor.y + velY;
            if (meteor.nextY > screen_height) {
                meteor.reset();
                this.meteorPool.returnSprite(meteor);
                this.removeChild(meteor);
                this.meteors.splice(i, 1);
            }
        }
    }
    p.updateEnemies = function() {
        var enemy, i;
        var len = this.enemies.length - 1;
        for (i = len; i >= 0; i--) {
            enemy = this.enemies[i];

            var nextX = enemy.x + enemy.velx;
            var nextY = enemy.y + enemy.vely;

            if (nextX < (this.leftWall + 20)) {
                nextX = this.leftWall + 20;
                enemy.velx *= -1;
            } else if (nextX > (this.rightWall - 20)) {
                nextX = this.rightWall - 20;
                enemy.velx *= -1;
            }

            if (nextY > (this.floor / 1.5)) {
                nextY = this.floor / 1.5;
                enemy.vely *= -1;
            } else if (nextY < (this.ceiling)) {
                nextY = this.ceiling;
                enemy.vely *= -1;
            }

            enemy.nextX = nextX;
            enemy.nextY = nextY;
        }
    }
    p.updateBoss = function() {
        if (this.boss != null) {
            var nextX = this.boss.x + this.boss.velx;
            var nextY = this.boss.y + this.boss.vely;

            if (nextX < (this.leftWall + 35)) {
                nextX = this.leftWall + 35;
                this.boss.velx *= -1;
            } else if (nextX > (this.rightWall - 35)) {
                nextX = this.rightWall - 35;
                this.boss.velx *= -1;
            }

            if (nextY > (this.floor / 1.5)) {
                nextY = this.floor / 1.5;
                this.boss.vely *= -1;
            } else if (nextY < (this.ceiling)) {
                nextY = this.ceiling;
                this.boss.vely *= -1;
            }

            this.boss.nextX = nextX;
            this.boss.nextY = nextY;
        }
    }
    p.updateHeroBullets = function() {
        var bullet, i, velY;
        var len = this.heroBullets.length - 1;
        for (i = len; i >= 0; i--) {
            bullet = this.heroBullets[i];
            velY = bullet.speed * this.delta / 1000;
            bullet.nextY = bullet.y - velY;
            if (bullet.nextY < 0) {
                //this.heroBulletPool.returnSprite(bullet);                
                if ((p.heroBulletType == 1) && (bullet instanceof game.Bullet)) {
                    this.heroBulletPool.returnSprite(bullet);
                } else if ((p.heroBulletType == 2) && (bullet instanceof game.Missile)) {
                    this.heroMissilePool.returnSprite(bullet);
                }
                this.removeChild(bullet);
                this.heroBullets.splice(i, 1);
            }
        }
    }
    p.updateEnemyBullets = function() {
            var bullet, i, velY;
            var len = this.enemyBullets.length - 1;
            for (i = len; i >= 0; i--) {
                bullet = this.enemyBullets[i];
                velY = bullet.speed * this.delta / 1000;
                bullet.nextY = bullet.y + velY;
                if (bullet.nextY > screen_height) {
                    this.enemyBulletPool.returnSprite(bullet);
                    this.removeChild(bullet);
                    this.enemyBullets.splice(i, 1);
                }
            }
        }
        /*
         *
         * RENDER FUNCTIONS
         *
         */
    p.renderStars = function() {
        var i, star;
        for (i = 0; i < this.stars.length; i++) {
            star = this.stars[i];
            star.y = star.nextY;
        }
    }
    p.renderHeroShip = function() {
        this.heroShip.x = this.heroShip.nextX;
        this.heroShip.y = this.heroShip.nextY;
    }
    p.renderHeroBullets = function() {
        var bullet, i;
        var len = this.heroBullets.length - 1;
        for (i = len; i >= 0; i--) {
            bullet = this.heroBullets[i];
            if (bullet.shouldDie) {
                this.removeChild(bullet);
                bullet.reset();
                //this.heroBulletPool.returnSprite(bullet);
                if ((p.heroBulletType == 1) && (bullet instanceof game.Bullet)) {
                    this.heroBulletPool.returnSprite(bullet);
                } else if ((p.heroBulletType == 2) && (bullet instanceof game.Missile)) {
                    this.heroMissilePool.returnSprite(bullet);
                }
                this.heroBullets.splice(i, 1);
            } else {
                bullet.y = bullet.nextY;
            }
        }
    }
    p.renderEnemyBullets = function() {
        var bullet, i;
        var len = this.enemyBullets.length - 1;
        for (i = len; i >= 0; i--) {
            bullet = this.enemyBullets[i];
            if (bullet.shouldDie) {
                this.removeChild(bullet);
                bullet.reset();
                this.enemyBulletPool.returnSprite(bullet);
                this.enemyBullets.splice(i, 1);
            } else {
                bullet.y = bullet.nextY;
            }
        }
    }
    p.renderMeteors = function() {
        var meteor, i;
        var len = this.meteors.length - 1;
        for (i = len; i >= 0; i--) {
            meteor = this.meteors[i];
            if (meteor.shouldDie) {
                this.scoreboard.updateScore(meteor.points);
                this.meteors.splice(i, 1);
                this.removeChild(meteor);
                this.spawnEnemyExplosion(meteor.x, meteor.y);
                this.spawnCollectMissile(meteor.x, meteor.y);
                this.spawnCollectHealthMeterUp(meteor.x, meteor.y);
                meteor.reset();
                this.meteorPool.returnSprite(meteor);
            } else {
                meteor.y = meteor.nextY;
            }
        }
    }
    p.renderEnemies = function() {
        var enemy, i;
        var len = this.enemies.length - 1;
        for (i = len; i >= 0; i--) {
            enemy = this.enemies[i];
            if (enemy.shouldDie) {
                this.scoreboard.updateScore(enemy.points);
                this.enemies.splice(i, 1);
                this.removeChild(enemy);
                this.spawnEnemyExplosion(enemy.x, enemy.y);
                this.spawnCollectMissile(enemy.x, enemy.y);
                this.spawnCollectHealthMeterUp(enemy.x, enemy.y);
                enemy.reset();
                this.enemyPool.returnSprite(enemy);
            } else {
                enemy.x = enemy.nextX;
                enemy.y = enemy.nextY;
            }
        }
    }
    p.renderBoss = function() {
            if (this.boss != null) {
                if (this.boss.shouldDie) {
                    this.scoreboard.updateScore(this.boss.points);
                    this.removeChild(this.boss);
                    this.boss.explode();
                    this.boss.reset();
                    this.boss = null;
                } else {
                    this.boss.x = this.boss.nextX;
                    this.boss.y = this.boss.nextY;
                }
            }
        }
        /*
         *
         * CHECK FUNCTIONS
         *
         */
    p.checkForMeteorSpawn = function(time) {
        if (time - this.meteorLastSpawnTime > this.meteorSpawnWaiter) {
            this.spawnMeteor();
            this.meteorLastSpawnTime = time;
        }
    }
    p.checkForEnemySpawn = function(time) {
        if (time - this.enemyLastSpawnTime > this.enemySpawnWaiter) {
            this.spawnEnemyShip();
            this.enemyLastSpawnTime = time;
        }
    }
    p.checkForBossSpawn = function(time) {
        //if ((time - this.bossLastSpawnTime > this.bossSpawnWaiter) &&
        if ((this.scoreboard.score - this.bossLastSpawnPoints > this.bossSpawnWaiter) &&
            (this.boss == null)) {
            this.nextBossShip += 1;
            this.spawnBossShip(this.nextBossShip);

            //this.bossLastSpawnTime = time;
        }
        //else if (this.boss != null) {
        //    this.bossLastSpawnTime = time;
        //}
    }
    p.checkForBossFire = function(time) {
        if (this.boss != null) {
            var i;
            var len = this.enemies.length - 1;
            for (i = len; i >= 0; i--) {
                if (time - this.boss.lastFired > this.boss.fireDelay) {
                    this.spawnBossBullet(this.boss);
                    this.boss.lastFired = time;
                }
            }
        }
    }
    p.checkForEnemyFire = function(time) {
        var enemy, i;
        var len = this.enemies.length - 1;
        for (i = len; i >= 0; i--) {
            enemy = this.enemies[i];
            if (time - enemy.lastFired > enemy.fireDelay) {
                this.spawnEnemyBullet(enemy);
                enemy.lastFired = time;
            }
        }
    }
    p.checkHeroBullets = function() {
        var i, b, bullet, enemy, collision;
        for (i in this.enemies) {
            enemy = this.enemies[i];
            for (b in this.heroBullets) {
                bullet = this.heroBullets[b];
                collision = ndgmr.checkPixelCollision(enemy, bullet);
                if (collision) {
                    enemy.takeDamage(p.heroBulletType);
                    bullet.shouldDie = true;
                }
            }
        }
    }
    p.checkHeroBulletsBoss = function() {
        if (this.boss != null) {
            var i, b, bullet, collision;
            for (b in this.heroBullets) {
                bullet = this.heroBullets[b];
                collision = ndgmr.checkPixelCollision(this.boss, bullet);
                if (collision) {
                    this.boss.takeDamage(p.heroBulletType);
                    bullet.shouldDie = true;
                }
            }
        }
    }
    p.checkHeroBulletsMeteor = function() {
        var i, b, bullet, meteor, collision;
        for (i in this.meteors) {
            meteor = this.meteors[i];
            for (b in this.heroBullets) {
                bullet = this.heroBullets[b];
                collision = ndgmr.checkPixelCollision(meteor, bullet);
                if (collision) {
                    meteor.takeDamage(p.heroBulletType);
                    bullet.shouldDie = true;
                }
            }
        }
    }
    p.checkEnemyBullets = function() {
        var b, bullet, collision;
        for (b in this.enemyBullets) {
            bullet = this.enemyBullets[b];
            collision = ndgmr.checkPixelCollision(this.heroShip, bullet);
            if (collision) {
                bullet.shouldDie = true;
                this.heroShip.takeDamage();
                this.heroShip.shouldDie;
                this.healthMeter.takeDamage(20);
            }
        }
    }
    p.checkShips = function() {
        var enemy, i, len, meteor;
        len = this.enemies.length - 1;
        for (i = len; i >= 0; i--) {
            enemy = this.enemies[i];
            if (enemy.y > screen_height / 2) {
                collision = ndgmr.checkPixelCollision(this.heroShip, enemy);
                if (collision) {
                    this.removeChild(enemy);
                    this.enemies.splice(i, 1);
                    this.spawnEnemyExplosion(enemy.x, enemy.y);
                    this.heroShip.shouldDie = true;
                    break;
                }
            }
        }

        len = this.meteors.length - 1;
        for (i = len; i >= 0; i--) {
            meteor = this.meteors[i];
            if (meteor.y > screen_height / 2) {
                collision = ndgmr.checkPixelCollision(this.heroShip, meteor);
                if (collision) {
                    this.removeChild(meteor);
                    this.meteors.splice(i, 1);
                    this.spawnEnemyExplosion(meteor.x, meteor.y);
                    this.heroShip.shouldDie = true;
                    break;
                }
            }
        }

        if (this.boss != null) {
            collision = ndgmr.checkPixelCollision(this.heroShip, this.boss);
            if (collision) {
                this.heroShip.shouldDie = true;
            }
        }
    }
    p.checkHealth = function(e) {
        if (this.healthMeter.empty) {
            this.heroShip.shouldDie = true;
        }
    }
    p.checkHero = function() {
        if (this.heroShip.shouldDie) {
            p.heroBulletType = 1;
            this.numLives--;
            this.heroShip.explode();
            this.lifeBox.removeLife();
            this.betweenLevels = true;
            this.deleteHeroBullets();
            this.healthMeter.reset();
        }
    }
    p.checkBoss = function() {
        if ((this.boss != null) && (this.boss.shouldDie)) {
            this.boss.explode();
            this.spawnEnemyExplosion(this.boss.x, this.boss.y);
            this.bossLastSpawnPoints = this.scoreboard.score;

            this.level++; //level up
            this.levelup = true; //to play trasition
            this.healthMeter.reset(); //restore health meter to full
            this.enemySpawnWaiter -= 130 * this.level; //enemy spawn faster than previous level
            this.bossSpawnWaiter += 150 * this.level; //more score needed before next boss spawn

            game.score = this.scoreboard.getScore();
            this.dispose();
    
            if (this.nextBossShip == 1) {
                this.dispatchEvent(game.GameStateEvents.GAME_TRANSITION_1);
            } else {
                if (this.nextBossShip == 2) {
                    this.dispatchEvent(game.GameStateEvents.GAME_TRANSITION_2);
                } else {
                    this.dispatchEvent(game.GameStateEvents.GAME_WIN);    
                }
            }

            game.gScore = this.scoreboard.getScoreValue();
            game.gNextBossShip = this.nextBossShip;
            game.gNumLives = this.numLives;
            game.gLevel = this.level;
        }
    }
    p.checkGame = function(e) {
        if (this.numLives > 0) {
            this.heroShip.reset();
            this.heroShip.makeInvincible(true);
            this.healthMeter.reset();
            this.betweenLevels = false;
        } else {
            game.score = this.scoreboard.getScore();
            this.dispose();
            this.dispatchEvent(game.GameStateEvents.GAME_OVER);
        }
    }
    p.checkCollectMissile = function() {
        // Verify the lifetime of the collectible missile in the stage
        if (p.collectMissile != null) {
            if (p.collectMissileTime <= 300) {
                p.collectMissileTime += 1;
            } else {
                this.removeChild(p.collectMissile);
                p.collectMissile = null;
                p.collectMissileTime = 0;
            }

        }
        // Verify the collision of the player and the collectible missile
        if (p.collectMissile != null) {
            collision = ndgmr.checkPixelCollision(this.heroShip, p.collectMissile);
            if (collision) {
                p.heroBulletType = 2;
                this.removeChild(p.collectMissile);
                p.collectMissile = null;
                this.heroShip.makeInvincible(true);
                this.deleteHeroBullets();
            }
        }
    }
    p.checkCollectHealthMeterUp = function() {
        // Verify the lifetime of the collectible green cross in the stage
        if (p.collectHealthMeterUp != null) {
            if (p.collectHealthMeterUpTime <= 300) {
                p.collectHealthMeterUpTime += 1;
            } else {
                this.removeChild(p.collectHealthMeterUp);
                p.collectHealthMeterUp = null;
                p.collectHealthMeterUpTime = 0;
            }

        }
        // Verify the collision of the player and the collectible green cross
        if (p.collectHealthMeterUp != null) {
            collision = ndgmr.checkPixelCollision(this.heroShip, p.collectHealthMeterUp);
            if (collision) {
                this.removeChild(p.collectHealthMeterUp);
                p.collectHealthMeterUp = null;
                this.heroShip.makeInvincible(true);
                // If the healthmeter bar is full do not add
                if (this.healthMeter.getDamageValue() < 1){
                    this.healthMeter.takeDamage(-20);
                }                
            }
        }
    }
    p.deleteHeroBullets = function() {
        var b, bullet;
        for (b in this.heroBullets) {
            bullet = this.heroBullets[b];
            this.removeChild(bullet);
            bullet.reset();
            this.heroBullets.splice(b, 1);
        }

        //this.heroBulletPool = new game.SpritePool(game.Bullet, 20);
        //this.heroMissilePool = new game.SpritePool(game.Missile, 20);
    }

    p.deleteEnemyBullets = function() {
        var b, bullet;
        for (b in this.enemyBullets) {
            bullet = this.enemyBullets[b];
            this.removeChild(bullet);
            bullet.reset();
            this.enemyBullets.splice(b, 1);
        }

        //this.enemyBulletPool = new game.SpritePool(game.Bullet, 50);
    }

    p.deleteEnemies = function() {
        var enemy, i;
        var len = this.enemies.length - 1;
        for (i = len; i >= 0; i--) {
            enemy = this.enemies[i];
            this.enemies.splice(i, 1);
            this.removeChild(enemy);
            enemy.reset();
        }
    }

    p.deleteMeteors = function() {
        var meteor, i;
        var len = this.meteors.length - 1;
        for (i = len; i >= 0; i--) {
            meteor = this.meteors[i];
            this.meteors.splice(i, 1);
            this.removeChild(meteor);
            meteor.reset();
        }
    }

    p.resetGame = function() {
        this.enemies = [];
        this.enemyBullets = [];

        this.heroBulletPool = new game.SpritePool(game.Bullet, 20);
        this.heroMissilePool = new game.SpritePool(game.Missile, 20);
        this.enemyBulletPool = new game.SpritePool(game.Bullet, 50);
        this.enemyPool = new game.SpritePool(game.EnemyShip, 50);
        this.meteorPool = new game.SpritePool(game.Meteor, 10);
        this.explosionPool = new game.SpritePool(game.Explosion, 20);
    }

    /*
     *
     * SPAWN FUNCTION
     *
     */
    p.spawnMeteor = function() {
        var meteor = this.meteorPool.getSprite();
        meteor.y = -meteor.getBounds().height;
        meteor.x = Utils.getRandomNumber(meteor.getBounds().width, screen_width - meteor.getBounds().width);
        this.addChild(meteor);
        this.meteors.push(meteor);
    }

    p.spawnEnemyShip = function() {
        var enemy = this.enemyPool.getSprite();
        enemy.y = 0;
        enemy.x = Utils.getRandomNumber(enemy.getBounds().width, screen_width - enemy.getBounds().width);

        createjs.Tween.get(enemy).to({ y: 150 }, 2000);

        this.addChild(enemy);
        this.enemies.push(enemy);
    }

    p.spawnBossShip = function() {
        if (this.nextBossShip < 4) {
            this.boss = new game.BossShip(this.nextBossShip);
            this.boss.y = -this.boss.getBounds().height;
            this.boss.x = Utils.getRandomNumber(this.boss.getBounds().width, screen_width - this.boss.getBounds().width);
            this.addChild(this.boss);
            createjs.Tween.get(this.boss).to({ y: 150 }, 2000);
            createjs.Tween.get(this.boss).to({ x: 150 }, 2000);
            this.boss.nextX = this.boss.x;
            this.boss.nextY = this.boss.y;
        }
    }
    p.spawnBossBullet = function(boss) {
        var bullet = this.enemyBulletPool.getSprite();
        bullet.currentAnimationFrame = 1;
        bullet.y = boss.y;
        bullet.x = boss.x;
        this.addChild(bullet);
        this.enemyBullets.push(bullet);
    }
    p.spawnEnemyBullet = function(enemy) {
        var bullet = this.enemyBulletPool.getSprite();
        bullet.currentAnimationFrame = 1;
        bullet.y = enemy.y;
        bullet.x = enemy.x;
        this.addChild(bullet);
        this.enemyBullets.push(bullet);
    }
    p.spawnHeroBullet = function() {
        var bullet;
        if (p.heroBulletType == 1) {
            bullet = this.heroBulletPool.getSprite();
        } else {
            bullet = this.heroMissilePool.getSprite();
        }
        bullet.x = this.heroShip.x;
        bullet.y = this.heroShip.y - this.heroShip.getBounds().height / 2;
        this.addChild(bullet);
        this.heroBullets.push(bullet);
    }
    p.spawnEnemyExplosion = function(x, y) {
        var explosion = this.explosionPool.getSprite();
        explosion.x = x - 45;
        explosion.y = y - 30;
        this.addChild(explosion);
        explosion.on('animationend', this.explosionComplete, this, true);
        explosion.play();
        createjs.Sound.play(game.assets.EXPLOSION);
    }
    p.explosionComplete = function(e) {
        var explosion = e.target;
        this.removeChild(explosion);
        this.explosionPool.returnSprite(explosion);
    }
    p.spawnCollectMissile = function(x, y) {
        if ((p.collectMissile == null) && (p.heroBulletType == 1)) {
            var num = Utils.getRandomNumber(0, 5) + 1;
            //num = 2;
            if (num == 1) {
                p.collectMissile = new game.Missile();
                p.collectMissile.x = x;
                p.collectMissile.y = y;
                this.addChild(p.collectMissile);
                p.collectMissileTime = 1;
            }
        }
    }
    p.spawnCollectHealthMeterUp = function(x, y) {
        if (p.collectHealthMeterUp == null) {
            var num = Utils.getRandomNumber(0, 5) + 1;
            //num = 2;
            if (num == 1) {
                p.collectHealthMeterUp = new game.HealthMeterUp();
                p.collectHealthMeterUp.x = x;
                p.collectHealthMeterUp.y = y;
                this.addChild(p.collectHealthMeterUp);
                p.collectHealthMeterUpTime = 1;
            }
        }
    }


    /*
     *
     * GAME LOOP
     *
     */
    p.update = function() {
        this.updateBackground();
        this.updateHeroShip()
        this.updateMeteors();
        this.updateEnemies();
        this.updateBoss();
        this.updateHeroBullets();
        this.updateEnemyBullets();
    }
    p.render = function() {
        this.renderStars();
        this.renderHeroShip();
        this.renderMeteors();
        this.renderEnemies();
        this.renderBoss();
        this.renderHeroBullets();
        this.renderEnemyBullets();
    }
    p.run = function(tickEvent) {
        this.delta = tickEvent.delta;

        if (!this.betweenLevels) {
            this.update();
            this.render();
            if (!this.levelup) {
                this.checkForMeteorSpawn(tickEvent.time);
                this.checkForEnemySpawn(tickEvent.time);
                this.checkForBossSpawn(tickEvent.time);
            }
            this.checkForEnemyFire(tickEvent.time);
            this.checkForBossFire(tickEvent.time);
            this.checkHeroBullets();
            this.checkHeroBulletsBoss();
            this.checkHeroBulletsMeteor();
            if (!this.heroShip.invincible) {
                this.checkEnemyBullets();
                this.checkShips();
            }
            this.checkHealth();
            this.checkHero();
            this.checkBoss();
            this.checkCollectMissile();
            this.checkCollectHealthMeterUp();
        }
    }
    p.dispose = function() {
        document.onkeydown = null;
        document.onkeyup = null;
    }
    window.game.Game = Game;

}(window));