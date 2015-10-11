game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
		
		me.levelDirector.loadLevel("map1");
		me.game.world.addChild(new me.ColorLayer("background", "#2277AA", 0));
        me.game.world.addChild(new game.Sumatorio(5,-5), 6);
        me.game.world.addChild(new game.Contenedor(0,15,1,3000,["pinchos","pinchos","pinchos","cangrejos","tortugas","moscas","moscas","cangrejos","pinchos","cangrejos","moscas","moscas"]));
        me.game.world.addChild(new game.Contenedor(230,15,-1,3600,["pinchos","pinchos","cangrejos","moscas","moscas","cangrejos","pinchos","cangrejos","moscas","moscas"]));
        me.game.world.addChild(new game.Punch(110,130), 6);
		me.game.world.addChild(new game.Mario(50,180));
		// me.game.world.addChild(new game.Luigi(180,180));

		me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.A, "jump");
        me.input.bindKey(me.input.KEY.DOWN, "agachar");
       
		game.data.tuberiasArray = me.game.world.getChildByName("tuberia");
		

    },
 
 
    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
		 me.input.unbindKey(me.input.KEY.LEFT);
        me.input.unbindKey(me.input.KEY.RIGHT);
        me.input.unbindKey(me.input.KEY.A);
        me.input.unbindKey(me.input.KEY.D);
		me.input.unbindKey(me.input.KEY.SPACE);
    }
});