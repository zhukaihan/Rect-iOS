game.resources = [
	/**
	 * Graphics.
	 */
 	// our level tileset
	{name: "level1_sprites", type:"image", src: "data/map/level1_sprites.png"},
	{name: "level2_sprites", type:"image", src: "data/map/level2_sprites.png"},
	{name: "level3_sprites", type:"image", src: "data/map/level3_sprites.png"},
	{name: "level4_sprites", type:"image", src: "data/map/level4_sprites.png"},
	{name: "level5_sprites", type:"image", src: "data/map/level5_sprites.png"},
	{name: "level6_sprites", type:"image", src: "data/map/level6_sprites.png"},

	// the main player spritesheet
	{name: "player",     type:"image",	src: "data/img/sprite/player.png"},
	// the spinning coin spritesheet
	{name: "spinning_coin_gold",  type:"image",	src: "data/img/sprite/spinning_coin_gold.png"},
	// our enemty entity
	{name: "enemy",       type:"image",	src: "data/img/sprite/enemy.png"},
	// game font
	{name: "32x32_font",          type:"image",	src: "data/img/font/32x32_font.png"},
	// title screen
	{name: "title_screen",        type:"image",	src: "data/img/gui/title_screen.png"},
	// the parallax background
	{name: "area01_bkg0",         type:"image",	src: "data/img/area01_bkg0.png"},
	{name: "area01_bkg1",         type:"image",	src: "data/img/area01_bkg1.png"},
	// the player body part
	{name: "oneBodyPart", type:"image", src: "data/img/sprite/part.png"},
	//{name: "mapBlock", type:"image", src: "data/img/map/block.png"},
	{name: "lift", type:"image", src: "data/map/lift.png"},
	{name: "gate", type:"image", src: "data/map/gate.png"},

	/*
	 * Maps.
 	 */
	{name: "level1", type: "tmx",	src: "data/map/level1.tmx"},
	{name: "level2", type: "tmx",	src: "data/map/level2.tmx"},
	{name: "level3", type: "tmx",	src: "data/map/level3.tmx"},
	{name: "level4", type: "tmx",	src: "data/map/level4.tmx"},
	{name: "level5", type: "tmx",	src: "data/map/level5.tmx"},
	{name: "level6", type: "tmx",	src: "data/map/level6.tmx"},

	/*
	 * Background music.
	 */
	{name: "dst-inertexponent", type: "audio", src: "data/bgm/"},

	/*
	 * Sound effects.
	 */
	{name: "cling", type: "audio", src: "data/sfx/"},
	{name: "stomp", type: "audio", src: "data/sfx/"},
	{name: "jump",  type: "audio", src: "data/sfx/"}
];
