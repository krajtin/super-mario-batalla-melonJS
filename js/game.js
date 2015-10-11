var game = {
	
	data:
	{
		
		idJugador:'mario',
		tuberiasArray:'',
		jugadores:'',
		almacen:[],
		contadorEnemigos:0,
		contadorMonedas:0,
		contadorSetas:0,
		contadorSetasMalas:0,
		jugadorMonedas:[],
		empezarJuego:true,
		ganador:'',
		
	},
    // Run on page load.
    "onload" : function () {
		// me.sys.interpolation = true;
		me.sys.pauseOnBlur=false;
		// me.sys.fps = 30;
		
        // Initialize the video.
        if (!me.video.init(240, 300, {wrapper : "screen", scale : "auto"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        } 
		
		
        // add "#debug" to the URL to enable the debug Panel
        if (document.location.hash === "#debug") {
            window.onReady(function () {
                me.plugin.register.defer(this, me.debug.Panel, "debug", me.input.KEY.V);
            });
        }
		 // me.debug.renderHitBox = true;
		me.pool.register("jugador", game.Jugador);
		me.pool.register("bloque", game.Bloque);
		me.pool.register("tuberia", game.Tuberia);
		me.pool.register("monedas", game.Monedas,true);
		me.pool.register("seta", game.Seta,true);
		me.pool.register("punch", game.Punch,true);
	
		// me.pool.register("enemigo", game.Enemigo);
		me.pool.register("caparazones", game.Caparazones,true);
		me.pool.register("moscas", game.Moscas,true);
		me.pool.register("pinchos", game.Pinchos,true);
		me.pool.register("cangrejos", game.Cangrejos,true);
		me.pool.register("tortugas", game.Tortugas,true);
		me.pool.register("boo", game.Boo,true);
		
		
		
        // Initialize the audio.
        // me.audio.init("mp3,ogg");
        me.audio.init("wav");
 
        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);
 
        // Load the resources.
        me.loader.preload(game.resources);
 
        // Initialize melonJS and display a loading screen.
        me.state.change(me.state.LOADING);
    },
 
 
 
    // Run on game resources loaded.
    "loaded" : function () {
		// cliente.conexion();
        // set the "Play/Ingame" Screen Object
		game.data.jugadorMonedas[0]=0;
		game.data.jugadorMonedas[1]=0;
		
        this.playScreen = new game.PlayScreen();
        me.state.set(me.state.PLAY, this.playScreen);
		
		this.texture = new me.video.renderer.Texture(
		me.loader.getJSON("mario_T"),
		me.loader.getImage("mario_T")
);
		
        // start the game
        me.state.change(me.state.PLAY);
    },
	
	crearJugador:function(nombre)
	{
		//Aisgnamos el id al jugador
		game.data.idJugador=nombre;
		game.data.almacen=me.game.world.getChildByName("jugador");	
	},
	moverJugador:function(x,y,n){
		game.data.almacen[n].pos.x=x;
		game.data.almacen[n].pos.y=y;
	},
};