var restartButton;

game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
		me.sys.gravity = 0.98;
		// play the audio track
		me.audio.playTrack("dst-inertexponent");

    	// load a level
		me.levelDirector.loadLevel("level1");

		// reset the score
		game.data.score = 0;


		restartButton = new myButton(600,440);
		me.game.world.addChild(restartButton);

//274
		gamerPlayer = new game.PlayerEntity(150, 274, {name: "mainPlayer", width: 20, height: 32, image: "player", framewidth: 32});
		me.game.world.addChild(gamerPlayer);
	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		// remove the HUD from the game world
		me.game.world.removeChild(this.HUD);
	}
});
