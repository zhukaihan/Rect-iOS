/**
 * Player Entity
 */
var bodyPartsNum = 4;
var liftActive = false;
var liftIsGoingUp = true;

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
                var thisBodyPart = new game.bodyPart(this.pos.x + 32, this.pos.y, {
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

        // return true if we moved or if the renderable was updated
        return true;//(this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

  /**
     * colision handler
     */
    onCollision : function (response, other) {
        if (response.b.name == "bodyPart") {
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
        /*me.collision.types.ENEMY_OBJECT:
            if ((response.overlapV.y>0) && !this.body.jumping) {
                // bounce (force jump)
                this.body.falling = false;
                this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.body.jumping = true;
                // play some audio
                me.audio.play("stomp");
                console.log("enemyed");
            } else {
                // let's flicker in case we touched an enemy
                //this.renderable.flicker(750);
            }
            return false;
        }

        // Make the object solid
        return true;*/
    }
});

game.bodyPart = me.Entity.extend({
    init: function(x, y, settings) {
        settings.image = "oneBodyPart";
        var width = settings.width;
        var height = settings.height;

        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        // walking & jumping speed
        this.body.setVelocity(5, 0);
        this.active = true;
    },
    update: function(dt) {
        if (this.active) {
            console.log("update");
            this.body.vel.x += this.body.maxVel.x * me.timer.tick;
            this.body.update(dt);
            me.collision.check(this);
        }
    },
    onCollision: function(response, other) {
        console.log("onCollisioned");
        if (response.b.body.collisionType && me.collision.types.ALL_OBJECT) {
            this.active = false;
        }
    }
});

/**
 * Coin Entity
 *//*
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
/*game.EnemyEntity = me.Entity.extend({
    init: function (x, y, settings) {
        // define this here instead of tiled
        settings.image = "wheelie_right";

        // save the area size defined in Tiled
        var width = settings.width;
        var height = settings.height;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 64;
        settings.frameheight = settings.height = 64;

        // redefine the default shape (used to define path) with a shape matching the renderable
        settings.shapes[0] = new me.Rect(0, 0, settings.framewidth, settings.frameheight);

        // call the parent constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.endX   = x + width - settings.framewidth;
        this.pos.x  = x + width - settings.framewidth;

        // to remember which side we were walking
        this.walkLeft = false;

        // walking & jumping speed
        this.body.setVelocity(4, 6);
    },

    // manage the enemy movement
    update : function (dt)
    {
        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }

            this.renderable.flipX(this.walkLeft);
            this.body.vel.x += (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;

        } else {
            this.body.vel.x = 0;
        }
        // check & update movement
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    //*
    //* colision handler
    //* (called when colliding with other objects)

    onCollision : function (response, other) {
        if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            // res.y >0 means touched by something on the bottom
            // which mean at top position for this one
            if (this.alive && (response.overlapV.y > 0) && response.a.body.falling) {
                this.renderable.flicker(750);
            }
            return false;
        }
        // Make all other objects solid
        return true;
    }
});
*/

game.liftEntity = me.Entity.extend({
    update: function(dt) {
        this.gravity = 0;
        this.body.setVelocity(0,4);
        if (liftActive) {
            if (liftIsGoingUp) {
                this.body.vel.y -= 1000 * me.timer.tick;
                this.body.update(dt);
            } else {
                this.body.vel.y += 1000 * me.timer.tick;
                this.body.update(dt);
            }
            //console.log(this.body);
            /*if (this.body.getShape(0).pos.y <= 288) {
                liftActive = false;
            }*/
        }
    }
});

game.liftButtonEntity = me.Entity.extend({

    onCollision: function (response, other) {
        if ((response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) && ((response.a.name == "mainPlayer") || (response.a.name == "liftButtonEntity"))) {
            liftActive = true;
            //liftIsGoingUp = !liftIsGoingUp;
        }
    }

});

game.doorEntity = me.Entity.extend({
    onCollision: function (response, other) {
        if ((response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) && (response.a.name == "mainPlayer") && (bodyPartsNum == 4)) {
            gameLevel++;
            me.game.world.removeChild(gamerPlayer);
            me.levelDirector.loadLevel("level" + gameLevel.toString());
            gamerPlayer = new game.PlayerEntity(150, 274, {name: "mainPlayer", width: 20, height: 32, image: "player", framewidth: 32})
            me.game.world.addChild(gamerPlayer);
        }
        return true;
    }
});
