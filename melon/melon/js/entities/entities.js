/**
 * Player Entity
 */
var bodyPartsNum = 4;
var liftActive = false;
var liftIsGoingUp = true;
var mousePos = {x: 0, y: 0};
var liftObjects = [];
var enemyObjects = [];

game.PlayerEntity = me.Entity.extend({
    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor

        this._super(me.Entity, 'init', [x, y , settings]);

        // set the default horizontal & vertical speed (accel vector)
        this.body.setVelocity(3, 15);

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;


        // define lost bodyParts animation (using the first frame)
        this.renderable.addAnimation("4",  [3]);
        this.renderable.addAnimation("3",  [2]);
        this.renderable.addAnimation("2",  [1]);
        this.renderable.addAnimation("1",  [0]);
        // set the large animation as default
        this.renderable.setCurrentAnimation("4");
    },

    /**
     * update the entity
     */
    update : function (dt) {
        if (me.input.isKeyPressed('left')) {
            // update the entity velocity
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            // update the entity velocity
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        } else {
            this.body.vel.x = 0;
        }
        if (me.input.isKeyPressed('jump')) {
            if (!this.body.jumping && !this.body.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick - bodyPartsNum + 4;
                // set the jumping flag
                this.body.jumping = true;
                // play some audio
                me.audio.play("jump");
            }
        }
        if (me.input.isKeyPressed('spit')) {
            if (bodyPartsNum > 1) {
                bodyPartsNum--;
                this.renderable.setCurrentAnimation(bodyPartsNum.toString());
                var thisBodyPart = new game.bodyPart(this.pos.x, this.pos.y, {
                    name: "bodyPart",
                    height: 7,
                    width: 20,
                    image: "oneBodyPart",
                    framewidth: 20,
                    frameheight: 7
                });
                me.game.world.addChild(thisBodyPart);
                this.body.getShape(0).setShape(0, 0, [new me.Vector2d(0, 0),
                                                      new me.Vector2d(20, 0),
                                                      new me.Vector2d(20, 11 + ((bodyPartsNum - 1) * 7)),
                                                      new me.Vector2d(0, 11 + ((bodyPartsNum - 1) * 7))
                                                  ]);
            }

        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        player = this;

        // return true if we moved or if the renderable was updated
        return true;//(this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

  /**
     * colision handler
     */
    onCollision : function (response, other) {
        if ((response.b.name == "bodyPart") && (response.b.active == false) && (bodyPartsNum < 4)) {
            bodyPartsNum++;
            this.renderable.setCurrentAnimation(bodyPartsNum.toString());
            this.body.getShape(0).setShape(0, 0, [new me.Vector2d(0, 0),
                                                  new me.Vector2d(20, 0),
                                                  new me.Vector2d(20, 11 + ((bodyPartsNum - 1) * 7)),
                                                  new me.Vector2d(0, 11 + ((bodyPartsNum - 1) * 7))
                                              ]);
            me.game.world.removeChild(response.b);
        }
        if (response.b.body.collisionType & me.collision.types.WORLD_SHAPE) {
            // Simulate a platform object
            if (other.type === "platform") {
                if (this.body.falling && !me.input.isKeyPressed('down') && (response.overlapV.y > 0) &&
                    // Shortest overlap would move the player upward
                    // The velocity is reasonably fast enough to have penetrated to the overlap depth
                    (~~this.body.vel.y >= ~~response.overlapV.y)
                ) {
                    // Disable collision on the x axis
                    response.overlapV.x = 0;
                    // Repond to the platform (it is solid)
                    return true;
                }
                // Do not respond to the platform (pass through)
                return false;
            }
        }
        if ((response.b.name == "enemyEntity") || (response.b.name == "enemyEntity")) {
            liftObjects = [];
            me.game.world.removeChild(gamerPlayer);
            me.levelDirector.reloadLevel();
            gamerPlayer = new game.PlayerEntity(150, 274, {name: "mainPlayer", width: 20, height: 32, image: "player", framewidth: 32})
            me.game.world.addChild(gamerPlayer);
        }

    }
});

game.bodyPart = me.Entity.extend({
    init: function(x, y, settings) {
        settings.image = "oneBodyPart";
        var width = settings.width;
        var height = settings.height;
        this.bodyPartPos = {x: x, y: y};
        // call the parent constructor

        this._super(me.Entity, 'init', [x, y , settings]);
        this.alwaysUpdate = true;
        // walking & jumping speed

        this.body.setMaxVelocity(10, 10);
        if ((mousePos.x !== 0) && (mousePos.y !== 0)) {
            var hypLen = Math.sqrt(Math.pow((mousePos.x - x), 2) + Math.pow((mousePos.y - y), 2));
            this.body.setVelocity(((mousePos.x - x) / hypLen),((mousePos.y - y) / hypLen));
            this.velocityX = ((mousePos.x - x) / hypLen);
            this.velocityY = ((mousePos.y - y) / hypLen);
            //this.body.setVelocity(((mousePos.x - x)),((mousePos.y - y)));
            //this.velocityX = ((mousePos.x - x));
            //this.velocityY = ((mousePos.y - y));
        } else {
            this.body.setVelocity(4, 0);
            this.velocityX = 4;
            this.velocityY = 0;
        }
        //console.log(((mousePos.x - x) / hypLen),((mousePos.y - y) / hypLen),x,y);
        this.active = true;
        this.hitGround == false;
        this.bodyPartUsed = false;
    },
    update: function(dt) {
        if (this.active) {
            //console.log(this.velocityX, this.velocityY);
/*
            if (this.velocityX >= 0) {
                this.body.vel.x += this.velocityX * me.timer.tick;
            } else {
                this.body.vel.x -= -this.velocityX * me.timer.tick;
            }
            if (this.velocityY < 0) {
                this.body.vel.y += this.velocityY * me.timer.tick;
            } else {
                this.body.vel.y -= -this.velocityY * me.timer.tick;
            }*/
            //this.body.setVelocity(this.velocityX, this.velocityY);
            this.body.vel.x += (this.velocityX < 0)? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
            this.body.vel.y -= (this.velocityY > 0)? -this.body.accel.y * me.timer.tick : this.body.accel.y * me.timer.tick;
            /*if (this.velocityX < 0) {
                this.body.vel.y += (this.velocityY > 0)? -this.body.accel.y * me.timer.tick : this.body.accel.y * me.timer.tick;
            } else {
                this.body.vel.y -= (this.velocityY > 0)? -this.body.accel.y * me.timer.tick : this.body.accel.y * me.timer.tick;
            }*/
            //console.log(this.body.accel, this.velocityX, this.velocityY);
            this.body.update(dt);
            me.collision.check(this);
        } else if (!this.hitGround) {
            if (this.velocityY < 0) {
                this.body.vel.y += 1000 * me.timer.tick;
            } else {
                this.body.vel.y += 1000 * me.timer.tick;
            }
            this.body.update(dt);
            me.collision.check(this);
        }
    },
    onCollision: function(response, other) {
        if ((response.b.body.collisionType && me.collision.types.ALL_OBJECT) && ((response.a.name !== "mainPlayer") && (response.b.name !== "mainPlayer"))) {
            this.active = false;
            //console.log(response);
            this.body.setVelocity(0, 3);
            if (response.overlapV.y > 0) {
                this.hitGround == true;
            }
        }
    }
});

/**
 * Coin Entity
 */
 /*
game.CoinEntity = me.CollectableEntity.extend({

    init: function (x, y, settings) {
        // call the parent constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);
    },

    //*
    //* collision handler

    onCollision : function (response, other) {
        // do something when collide
        me.audio.play("cling");
        // give some score
        game.data.score += 250;
        // make sure it cannot be collected "again"
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);
        // remove it
        me.game.world.removeChild(this);

        return false;
    }
});
*/
/**
 * Enemy Entity
 */
game.EnemyEntity = me.Entity.extend({
    init: function (x, y, settings) {
        // define this here instead of tiled
        settings.image = "enemy";
        this.health = 2;
        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;
        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 32;
        settings.frameheight = settings.height = 32;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);
        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        // define lost bodyParts animation (using the first frame)
        this.renderable.addAnimation("1",  [1]);
        this.renderable.addAnimation("2",  [0]);
        // set the large animation as default
        this.renderable.setCurrentAnimation("2");
        // set start/end position based on the initial area size

        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.framewidth;
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were walking
        this.walkLeft = false;

        this.alwaysUpdate = true;

        this.defeated = false;

        var anEnemy = this;
        enemyObjects.push(anEnemy);

        this.gravity = 0.98;
        // walking & jumping speed
        this.body.setVelocity(4, 6);
    },

    // manage the enemy movement
    update : function (dt) {
        if ((this.alive) && (this.health > 0)) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }

            this.renderable.flipX(this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
            this.body.update(dt);
            me.collision.check(this);

        }
        // handle collisions against other shapes

        // return true if we moved or if the renderable was updated
        return false;//(this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    //*
    //* colision handler
    //* (called when colliding with other objects)

    onCollision : function (response, other) {
        if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            if (((response.a.name === "bodyPart") || (response.b.name === "bodyPart"))
            && ((response.a.bodyPartUsed == false) || (response.b.bodyPartUsed == false))) {
                if (response.a.name === "bodyPart") {
                    response.a.bodyPartUsed = true;
                } else {
                    response.b.bodyPartUsed = true;
                }
                this.health--;
                if (this.health <= 0){
                    this.alive = false;
                    me.game.world.removeChild(this);
                    this.defeated = true;
                }else{
                    this.renderable.setCurrentAnimation(this.health.toString());
                }
            }

        }
            // res.y >0 means touched by something on the bottom
            // which mean at top position for this one
        /*if (this.alive && (response.overlapV.y > 0) && response.a.body.falling) {
            this.renderable.flicker(750);
        }*/
        //return false;
    }
        // Make all other objects solid
        //return true;
    //}
});


game.liftEntity = me.Entity.extend({
    init: function(x, y, settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        if (settings.matchNum !== -1) {
            this.upHeight = settings.upHeight;
            this.matchNum = settings.matchNum;
            this.direction = settings.direction;
            this.motionTrigger = settings.motionTrigger;
            var anotherone = this;
            liftObjects.push(anotherone);
            //console.log(anotherone);
        }
        this.liftActive == false;
        this.gravity = 0;
        this.body.setVelocity(0,4);
        this.alwaysUpdate = true;
    },
    update: function(dt) {
        if (this.liftActive) {
           	if (this.direction == "disappear") {
        		me.game.world.removeChild(this);
   	    		this.liftActive = false;
       		} else if (this.direction == "up") {
         	    this.body.vel.y -= 1000 * me.timer.tick;
               	if (this.pos.y <= this.upHeight) {
                   	this.liftActive = false;
               	}
            } else {
   	            this.body.vel.y += 1000 * me.timer.tick;
    	        if (this.pos.y >= this.upHeight) {
        	        this.liftActive = false;
            	}
	        }
            this.body.update(dt);
        }
        if (this.motionTrigger == "enemy") {
            var allEnemyDefeated = true;
           	for (var i = 0; i < enemyObjects.length; i++) {
        	   	//console.log(enemyObjects[i].defeated);
           		if (!enemyObjects[i].defeated) {
           			allEnemyDefeated = false;
           			break;
           		}
           	}
           	if (allEnemyDefeated) {
           		this.motionTrigger = "";
           		this.liftActive = true;
           	}
        }
    }
});

game.liftButtonEntity = me.Entity.extend({
    init: function(x,y,settings) {
        this._super(me.Entity, 'init', [x, y, settings]);
        if (settings.matchNum !== null) {
            this.matchNum = settings.matchNum;
        }
    },

    onCollision: function (response, other) {
        if ((response.b.body.collisionType !== me.collision.types.WORLD_SHAPE)
        && ((response.a.name == "mainPlayer") || (response.a.name == "liftButtonEntity") || (response.b.name == "liftButtonEntity"))) {
            for (var i = 0; i < liftObjects.length; i++) {
                if (liftObjects[i].matchNum == this.matchNum) {
                    liftObjects[i].liftActive = true;
                    //me.game.world.removeChild(this);
                }
            }/*
            liftObjects.forEach(function(x) {
                if (x.matchNum == this.matchNum) {
                    x.liftActive = true;
                }
                console.log("liftoncolli");
            });*/
            //liftIsGoingUp = !liftIsGoingUp;
        }
    }

});

game.regenEntity = me.Entity.extend({
    onCollision: function (response, other) {
        if (response.a.name == "mainPlayer") {
            bodyPartsNum = 4;
            response.a.renderable.setCurrentAnimation(bodyPartsNum.toString());
            response.a.body.getShape(0).setShape(0, 0, [new me.Vector2d(0, 0),
                                                  new me.Vector2d(20, 0),
                                                  new me.Vector2d(20, 11 + ((bodyPartsNum - 1) * 7)),
                                                  new me.Vector2d(0, 11 + ((bodyPartsNum - 1) * 7))
                                              ]);
            me.game.world.removeChild(this);
        }
        if (response.b.name =="mainPlayer") {
            bodyPartsNum = 4;
            response.b.renderable.setCurrentAnimation(bodyPartsNum.toString());
            response.b.body.getShape(0).setShape(0, 0, [new me.Vector2d(0, 0),
                                                  new me.Vector2d(20, 0),
                                                  new me.Vector2d(20, 11 + ((bodyPartsNum - 1) * 7)),
                                                  new me.Vector2d(0, 11 + ((bodyPartsNum - 1) * 7))
                                              ]);
            me.game.world.removeChild(this);
        }
    }
});

game.doorEntity = me.Entity.extend({
    onCollision: function (response, other) {
        if ((response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) && (response.a.name == "mainPlayer") && (bodyPartsNum == 4)) {
            liftObjects = [];
            gameLevel++;
            me.game.world.removeChild(gamerPlayer);
            me.levelDirector.loadLevel("level" + gameLevel.toString());
            gamerPlayer = new game.PlayerEntity(150, 274, {name: "mainPlayer", width: 20, height: 32, image: "player", framewidth: 32})
            me.game.world.addChild(gamerPlayer);
        }
        return true;
    }
});

function mouseEventHandler(input) {
    mousePos = {x: input.gameWorldX, y: input.gameWorldY};
    //mousePos = me.input.globalToLocal(input.gameWorldX, input.gameWorldY);
    //console.log(input.gameWorldY);
}
