game.resources = [
	/**
	 * Graphics.
	 */
 	// our level tileset
	{name: "level1_sprites", type:"image", src: "data/map/level1_sprites.png"},

	// the main player spritesheet
	{name: "player",     type:"image",	src: "data/img/sprite/player.png"},
	// the spinning coin spritesheet
	{name: "spinning_coin_gold",  type:"image",	src: "data/img/sprite/spinning_coin_gold.png"},
	// our enemty entity
	{name: "wheelie_right",       type:"image",	src: "data/img/sprite/wheelie_right.png"},
	// game font
	{name: "32x32_font",          type:"image",	src: "data/img/font/32x32_font.png"},
	// title screen
	{name: "title_screen",        type:"image",	src: "data/img/gui/title_screen.png"},
	// the parallax background
	{name: "area01_bkg0",         type:"image",	src: "data/img/area01_bkg0.png"},
	{name: "area01_bkg1",         type:"image",	src: "data/img/area01_bkg1.png"},

	/*
	 * Maps.
 	 */
	{name: "level1", type: "tmx",	src: "data/map/level1.tmx"},
	{name: "area02", type: "tmx",	src: "data/map/area02.tmx"},

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
