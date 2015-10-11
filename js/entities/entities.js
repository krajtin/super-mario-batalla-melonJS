/********************************************************************************
								Entidad Jugador

/***********************************************************************************************/
game.Monedas = me.CollectableEntity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {

        this.direccion=settings.direccion || 1;
        this._super(me.CollectableEntity, "init", [x, y , {
			width:12,height:18,
			framewidth:12,frameheight:18,
			
		}]);
		this.alwaysUpdate=true;
	   this.body.setVelocity(0.8,5);
			
       this.renderable = game.texture.createAnimationFromName([
            "moneda_0.png", "moneda_1.png","moneda_2.png"
          
        ]);
        this.renderable.addAnimation("moneda",[0,1,2],200);
		this.renderable.setCurrentAnimation("moneda");
		
		
    },
	update:function(time){
		this.onVisibilidad();
		this.body.vel.x=this.body.accel.x*me.timer.tick*this.direccion;
		
		this.body.update(time);
		me.collision.check(this);
		
		
		return (this._super(me.CollectableEntity, 'update', [time]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
	},

    /**
     * collision handling
     */
   	onCollision: function (res, other) {
		switch (other.body.collisionType) {
          
			case me.collision.types.PLAYER_OBJECT:
				this.body.setCollisionMask(me.collision.types.NO_OBJECT);
				other.onMonedas(other.indiceJugador);
				me.audio.play("moneda",false,null,0.08);
				me.game.world.removeChild(this);
				
			return false;
			break;
			case me.collision.types.WORLD_SHAPE:
				res.overlapV.x = 0;
				if(other.type==="tuberia")
					return false;
					
				
			return true;
			break;
			
			default:
			return false;
		}
	},
	onVisibilidad:function(){
		
		if(!this.inViewport){
				
			if(this.pos.y>me.video.renderer.getHeight())
				me.game.world.removeChild(this);
			if(this.pos.x+this.width< 0)
				this.pos.x=me.video.renderer.getWidth();
			else if(this.pos.x> me.video.renderer.getWidth())
				this.pos.x=0;
			
			
		}
	}
});
game.Sumatorio = me.Renderable.extend ({

    // constructor
    init: function(x,y,nombre) {
        this._super(me.Renderable, "init", [x, y, 25, 25]);
		
        this.color = me.pool.pull("me.Color", 0, 0, 0);
		this.font = new me.Font("Arial", 15, "black");
		this.font2 = new me.Font("Arial", 25, "black");
		
		
        
    },
	
   draw:function(renderer)
   {
	   this.font.draw(renderer,game.data.jugadorMonedas[0]+"X", 20, -20);
	   this.font.draw(renderer,game.data.jugadorMonedas[1]+"X", 210 , -20);
	   this.font2.draw(renderer,game.data.ganador,(me.video.renderer.getWidth()-100)/2,50);
	   
	  
	   
   }

        
});
game.Contenedor = me.Entity.extend({
    init: function (x,y,enemigoDireccion,maxTiempo,moles)
    {
        this.enemigoDireccion=enemigoDireccion;
        this.moles = moles;
		
       
		this.indice=0;
        this.timer = 0;
        this.tiempoBoo1 = 0;
        this.tiempoBoo2 = 0;
        this.tiempoSeta = 0;
        this.tiempoSetaMala = 0;
       
     
        this._super(me.Entity, "init", [x,y,{width:10,height:10}]);

        this.maxTiempo = maxTiempo;
		this.body.collisionType = me.collision.types.NO_OBJECT;
		
    },

    /*
     * update function
     */
    update : function (dt)
    {
		if(game.data.empezarJuego!=true)
			return;
		
        this.timer += dt;
        this.tiempoBoo1 += dt;
        this.tiempoBoo2 += dt;
        this.tiempoSeta += dt;
        // this.tiempoSetaMala += dt;
		if((this.tiempoSeta) >= 43000 && game.data.contadorSetas==0){
			
			 me.game.world.addChild(me.pool.pull("seta",this.pos.x,this.pos.y,{tipoSeta:0,direccion:this.enemigoDireccion})); 
			 game.data.contadorSetas++;
			this.tiempoSeta=0;
		}
		if((this.tiempoSetaMala) >= 20000 && game.data.contadorSetasMalas==0){
			
			 me.game.world.addChild(me.pool.pull("seta",this.pos.x,this.pos.y,{tipoSeta:1,direccion:this.enemigoDireccion})); 
			 
			this.tiempoSetaMala=0;
			game.data.contadorSetasMalas++;
		}
		
		if((this.tiempoBoo1) >= 30000){
			
			me.game.world.addChild(me.pool.pull("boo",10,170,{direccion:this.enemigoDireccion}));
			this.tiempoBoo1=0;
		}
		if((this.tiempoBoo2) >= 50000){
			
			me.game.world.addChild(me.pool.pull("boo",10,100,{direccion:this.enemigoDireccion}));
			this.tiempoBoo2=0;
		}
		if((this.timer) >= 100  && game.data.contadorMonedas>0 ){
			
			me.game.world.addChild(me.pool.pull("monedas",this.pos.x+20,this.pos.y,{direccion:this.enemigoDireccion}));
			game.data.contadorMonedas--;
		}
			
        if ((this.timer) >= this.maxTiempo  && game.data.contadorEnemigos<4 ) {
				
				
				if(this.indice<this.moles.length){
					
					me.game.world.addChild(me.pool.pull(this.moles[this.indice],this.pos.x,this.pos.y-10,{direccion:this.enemigoDireccion}));
					
					game.data.contadorEnemigos++;
					this.indice++;
					
				}
				else if(this.indice>=this.moles.length){
					this.indice=0;
					
				}
				
				this.timer = 0;
			
        }
         return false;
    }

});
game.Jugador = me.Entity.extend({
    init: function (x,y,idJugador,settings) {
		
		this.toques=1;
		this.fuerza=1;
		this.idJugador=idJugador;
		this.direccion=1;
		this.alturaSalto=0;
		this.dec=0.001;
		this.accionar=false;
		this.paralizado=false;
		this.agachado=false;
		this.ganar=false;
		 this._super(me.Entity, "init", [x, y, {
            image: settings.image,
			width: settings.width,
			height:settings.height,
            framewidth: settings.framewidth,
            frameheight: settings.frameheight,
			name:'jugador',
        }]);
		
		this.alwaysUpdate = true;
		this.varAnimacion="normal";
		
		this.body.setVelocity(0.13, 2);
		this.body.setMaxVelocity(3, 6);
		this.body.setFriction(0.08, 0);
		
		this.body.collisionType = me.collision.types.PLAYER_OBJECT;
		
		
		
		
    },
	onMonedas:function(indice){
		game.data.jugadorMonedas[indice]+=1;
		if(game.data.jugadorMonedas[indice]>=10)
			this.onGanar("Has ganado!!!");
	},
	update: function (time) {
		
		if(!this.inViewport){
			
			if(this.pos.x+this.width< 0)
			{
				this.pos.x=me.video.renderer.getWidth();
				
			}
			else if(this.pos.x> me.video.renderer.getWidth()){
				this.pos.x=0;
				
			}
			else if(this.pos.y>me.video.renderer.getHeight()){
				me.game.world.removeChild(this);
				 // me.levelDirector.reloadLevel();
				
			}
				
		}
	
		if(this.body.vel.x==0){
			
			this.renderable.setCurrentAnimation(this.varAnimacion);
			
		}
		
		if(game.data.idJugador==this.idJugador && !this.ganar)
		{
				if (me.input.isKeyPressed("right") && !this.paralizado) {
					
					this.direccion=1;
					this.renderable.flipX(true);
					
					if(this.body.vel.x <= -1)
					{
						this.body.vel.x +=this.dec* me.timer.tick;
						this.renderable.setCurrentAnimation("frenar");
					}else{
						if (!this.renderable.isCurrentAnimation("andando")) {
						this.renderable.setCurrentAnimation("andando");
						}
						this.body.vel.x +=this.body.accel.x* me.timer.tick;
					}
					 
					
					
				}
				 if (me.input.isKeyPressed("left")&& !this.paralizado) {
					
					
					this.direccion=-1;
					this.renderable.flipX(false);
					
					 if(this.body.vel.x >= 1)
					{
						this.body.vel.x -=this.dec* me.timer.tick;
						this.renderable.setCurrentAnimation("frenar");
					}else{
						if (!this.renderable.isCurrentAnimation("andando")) {
						this.renderable.setCurrentAnimation("andando");
						}
						this.body.vel.x -=this.body.accel.x* me.timer.tick;
					}
						
					
					
					
				}
				if (me.input.isKeyPressed("agachar")&& !this.paralizado) {
					
						this.anchorPoint.set(0,1);
						this.agachado=true;
						
						// this.body.addShape(new me.Rect(0, 0, 16, 16));
						// this.body.removeShapeAt(0);
						if (!this.renderable.isCurrentAnimation("agachar")) {
						this.renderable.setCurrentAnimation("agachar");
						}
						
					
				}
				else{
					
					// this.anchorPoint.set(0,0);
					this.agachado=false;
				}
				
				if (me.input.isKeyPressed('jump')&& !this.paralizado) {
					if (!this.renderable.isCurrentAnimation("saltar")) {
						this.renderable.setCurrentAnimation("saltar");
						
						}
					if (this.alturaSalto > 0) {
						
						this.body.jumping=true;
						this.alturaSalto -=10;
						
						this.body.vel.y = -this.body.accel.y*time;
									
					}
					if (!this.sonidoUnaVez) {
						this.sonidoUnaVez = true;
						me.audio.play("saltando",false,null,0.4);
						}
				
						
				  
				}
				
			
			if((this.body.vel.x!=0 || this.body.vel.y!=0))
				console.log("Aqui el socket movimieito");
				// cliente.socket.emit("moverJugador",this.pos.x,this.pos.y);
			
		}
		this.body.update(time);
		me.collision.check(this);
		return (this._super(me.Entity, 'update', [time]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
	},
	
	onCollision: function (res, other) {
		switch (other.body.collisionType) {
           case me.collision.types.WORLD_SHAPE:
				 
				res.overlapV.x = 0;
				if (other.type === "vuelta" && res.overlapV.y < 0 && !other.subido && this.body.jumping && !this.accionar) {
					
					this.alturaSalto=0;  
					other.onSubirBloque();
				  
				   return true;
				   break;
				}
				
				if (other.type === "tuberia" || other.type==="reActivar") {
					
				   return false;
				   break;
				}
				
			   if (this.body.falling  && res.overlapV.y > 0)
			   {
					// res.overlapV.x = 0;
				   this.alturaSalto=75;
				   this.accionar=false;
				   this.sonidoUnaVez=false;
				   return true;
				   break;
			   }
			return true;
			break;
			case me.collision.types.ENEMY_OBJECT:
				
				if(other.volteado && other.tipo!="tortuga")
				{
						var boundsA = other.getBounds();
						var boundsB = this.getBounds();
						var resta=~~(boundsA.left-boundsB.left);
						if(resta<0)
							other.onEmpujar(-1);
						else
							other.onEmpujar(1);
						
				}
				else if (!other.volteado && other.tipo!="tortuga" &&  !other.invulnerable){

					if(res.overlapV.y<1 && this.agachado)
						console.log("OK "+res.overlapV.y)
					else
						this.hurt();
				}
				
				
				
			return false;
			break;
			case me.collision.types.PLAYER_OBJECT:
				
				if(res.overlapV.y <0 &&  res.b.body.falling)
				{
					
					res.b.body.vel.y=-res.b.body.maxVel.y*me.timer.tick;
					res.a.onStunear();
					
				}
				else if(res.overlapV.x<0){
					
					res.b.body.vel.x-=res.a.fuerza;
					res.a.body.vel.x+=res.b.fuerza;
				}
				else if(res.overlapV.x>0){
					
					res.b.body.vel.x+=res.a.fuerza;
					res.a.body.vel.x-=res.b.fuerza;
				}
			
				
			return false;
			break;
			case me.collision.types.ACTION_OBJECT:
			
				if(res.overlapV.y < 0 && this.body.jumping && !this.accionar)
				{
					 this.alturaSalto=0;  
					this.accionar=true;
					other.onPulsado();
					
				}
						
			 return true;
			 break;
			
			
			default:
			return false;
		}
	},
	onStunear:function(){
		this.paralizado=true;
		this.varAnimacion="atontar";
		var _this=this;
		this.anchorPoint.set(0,1);
		me.timer.setTimeout(function () {
			
			_this.paralizado=false;
			_this.anchorPoint.set(0,0);
			_this.varAnimacion="normal";
		},900);
		
		
	},
	hurt : function () {
		this.toques--;
		if (!this.renderable.isFlickering())
        {
			if(this.toques<=0){
				
				this.varAnimacion="matar";
				me.audio.play("marioMuerto",false,null,0.5);
				this.body.setCollisionMask(me.collision.types.NO_OBJECT);
				
				this.body.vel.set(0,-5);
				this.body.gravity=0.2;
				
			}
			else{
				
				this.renderable.flicker(1500);
				this.fuerza=1;
				this.renderable.addAnimation("normal", [0]);
				this.renderable.setCurrentAnimation("normal");
				this.renderable.addAnimation("saltar", [2]);
				this.renderable.addAnimation("frenar", [3]);
				this.renderable.addAnimation("patear", [4]);
				this.renderable.addAnimation("subir", [5]);
				this.renderable.addAnimation("atontar", [6]);
				this.renderable.addAnimation("ganar", [7]);
				this.renderable.addAnimation("matar", [8]);
				this.renderable.addAnimation("andando", [0,1],200);
				this.renderable.addAnimation("agachar", [0]);
				this.body.removeShapeAt(0);
				this.body.addShape(new me.Rect(0, 0, 17, 17));
				
			}
				
			
		}
			
    },
	onAgrandar:function(){
		
		this.toques=2;
		this.fuerza=2;
		me.audio.play("seta",false,null,0.05);
		this.pos.y-=10;
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 17, 29));
		
		this.renderable.addAnimation("normal", [9]);
		this.renderable.addAnimation("saltar", [11,12],50);
		this.renderable.addAnimation("frenar", [13]);
		this.renderable.addAnimation("patear", [14]);
		this.renderable.addAnimation("subir", [14]);
		this.renderable.addAnimation("atontar", [18]);
		this.renderable.addAnimation("ganar", [15]);
		this.renderable.addAnimation("matar", [17]);
		this.renderable.addAnimation("andando", [9,10],200);
		this.renderable.addAnimation("agachar", [18]);
		this.renderable.setCurrentAnimation("normal");
		
	},
	
	onGanar:function(cadena){
		this.varAnimacion="ganar";
		game.data.ganador=cadena;
		this.ganar=true;
		this.body.setCollisionMask(me.collision.types.WORLD_SHAPE);
	},
	
});
game.Mario = game.Jugador.extend({
	
	init:function(x,y){
		
		this._super(game.Jugador, "init", [x,y,"mario",{
            width:17,
			height:17,
            framewidth: 17,
            frameheight: 17,
		}]);
		
		this.indiceJugador=0;
		
		this.renderable = game.texture.createAnimationFromName([
            "mario_peque_0.png", "mario_peque_1.png", "mario_peque_2.png",
            "mario_peque_3.png", "mario_peque_4.png", "mario_peque_5.png",
            "mario_peque_6.png", "mario_peque_7.png", "mario_peque_8.png",
			"mario_grande_0.png", "mario_grande_1.png", "mario_grande_2.png",
            "mario_grande_3.png", "mario_grande_4.png", "mario_grande_5.png",
            "mario_grande_6.png", "mario_grande_7.png", "mario_grande_8.png",
			"mario_grande_9.png"
           
        ]);
		this.renderable.addAnimation("normal", [0]);
		this.renderable.addAnimation("saltar", [2]);
		this.renderable.addAnimation("frenar", [3]);
		this.renderable.addAnimation("patear", [4]);
		this.renderable.addAnimation("subir", [5]);
		this.renderable.addAnimation("atontar", [6],300);
		this.renderable.addAnimation("ganar", [7]);
		this.renderable.addAnimation("matar", [8]);
		this.renderable.addAnimation("andando", [0,1],200);
		this.renderable.addAnimation("agachar", [0]);
		
		this.onAgrandar();
		
        this.renderable.setCurrentAnimation(this.varAnimacion);
		
		
		
	},
	onDeactivateEvent: function () {
		
		game.data.almacen=me.game.world.getChildByName("jugador")[1];
		game.data.almacen.onGanar("Has ganado\nLuigi!!!");
	},
	
});
game.Luigi = game.Jugador.extend({
	
	init:function(x,y){
		
		this._super(game.Jugador, "init", [x, y,"luigi",{
            width:17,
			height:17,
            framewidth: 17,
            frameheight: 17,
			
        }]);
		
		this.indiceJugador=1;
		this.renderable = game.texture.createAnimationFromName([
            "luigi_peque_0.png", "luigi_peque_1.png", "luigi_peque_2.png",
            "luigi_peque_3.png", "luigi_peque_4.png", "luigi_peque_5.png",
            "luigi_peque_6.png", "luigi_peque_7.png", "luigi_peque_8.png",
			"luigi_grande_0.png", "luigi_grande_1.png", "luigi_grande_2.png",
            "luigi_grande_3.png", "luigi_grande_4.png", "luigi_grande_5.png",
            "luigi_grande_6.png", "luigi_grande_7.png", "luigi_grande_8.png",
			"luigi_grande_9.png"
           
        ]);
		
		this.renderable.addAnimation("normal", [0]);
		this.renderable.addAnimation("saltar", [2]);
		this.renderable.addAnimation("frenar", [3]);
		this.renderable.addAnimation("patear", [4]);
		this.renderable.addAnimation("subir", [5]);
		this.renderable.addAnimation("atontar", [6],300);
		this.renderable.addAnimation("ganar", [7]);
		this.renderable.addAnimation("matar", [8]);
		this.renderable.addAnimation("andando", [0,1],200);
		this.renderable.addAnimation("agachar", [0]);
		
		
		
        this.renderable.setCurrentAnimation(this.varAnimacion);
		
		this.onAgrandar();
		
		
	},
	onDeactivateEvent: function () {
		game.data.almacen=me.game.world.getChildByName("jugador")[0];
		game.data.almacen.onGanar("Has ganado\nMario!!!");
		

	},
	
	
});
game.Enemigo = me.Entity.extend({
    init: function (x,y,settings) {
		
	
		this.volteado=false;
		this.invulnerable=true;
		this.varAnimacion="cambiarDir_0";
		this.direccion=settings.direccion || 1;
		this.tocoTuberia=false;
		this.potencia=0.3;
		this.vecesRetroceder=0;
		
		
        this._super(me.Entity, "init", [x, y, {
            // image: settings.image,
			width:settings.width,
			height:settings.height,
            framewidth: settings.framewidth,
            frameheight: settings.frameheight,
			name:'enemigo',
			
			
        }]);
		this.z=4;
		this.alwaysUpdate = true;
		this.body.gravity=0.25;
		this.gravedad=this.body.gravity;
		this.body.collisionType = me.collision.types.ENEMY_OBJECT;
		
		
		
    },
	update: function (time) {
		
		this.onVisibilidad();
		
		if(!this.volteado)
		{
			this.onMoverse();
				
		}
		
		
		if(this.direccion<0)
			this.renderable.flipX(false);
		else
			this.renderable.flipX(true);
		
		
		this.body.update(time);
		me.collision.check(this);
		return (this._super(me.Entity, 'update', [time]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
		
	},
	onSalirPorTuberia:function(id){
		for(var i=0;i<game.data.tuberiasArray.length;i++)
		{
			if(game.data.tuberiasArray[i].identificador==id && game.data.tuberiasArray[i].destino=="salida")
			{
				this.pos.x=game.data.tuberiasArray[i].pos.x;
				this.pos.y=game.data.tuberiasArray[i].pos.y+10;
				this.vecesRetroceder=0;
				break;
			}
		}
	},
	onCollision: function (res, other) {
		switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
				 
				res.overlapV.x=0;
								
				if(other.type==="vuelta" && other.subido){
					
					var boundsA = this.getBounds();
                    var boundsB = other.getBounds();
					var resta=~~(boundsA.left-boundsB.left);
					if(resta<0)
						this.onVuelta(-1,false);
					else
						this.onVuelta(1,false);
					  
					
					return true;
				
				}
				else if (other.type==="tuberia") {
					
				  this.invulnerable=true;
                  if(other.destino!="salida")
						this.onTuberia(other);
					
                   return false;
				}
				else if(other.type==="reActivar")
				{
					
					this.sonidoUnaVez = false;
					this.body.setVelocity(this.almacenVelX,this.almacenVelY);
					this.invulnerable=false;
					this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT  | me.collision.types.ENEMY_OBJECT | me.collision.types.PROJECTILE_OBJECT);
					
					return false;
				}
			
			return true;
			break;
			
			case me.collision.types.ENEMY_OBJECT:
				this.body.vel.x=0;
				if(!this.volteado && this.vecesRetroceder<3){
					
					this.onRetroceder();
				}
					
					
			return false;
			break;
			case me.collision.types.PROJECTILE_OBJECT:
				// this.body.vel.y=-this.body.maxVel.y * me.timer.tick;
				var _this=this;
				
				this.pos.y-=4;
				this.body.gravity=0;
				this.bajar = me.timer.setTimeout(function () {
					
				_this.body.gravity=_this.gravedad;
			}, 800);
			return false;
			break;
			
			default:
			return false;
			
			
			
		}
	},
	onRetroceder:function(){
		this.body.vel.x=0;
		this.volteado=true;
		
		this.varAnimacion="cambiarDir_"+this.enfadado;
		this.body.setCollisionMask(me.collision.types.WORLD_SHAPE);			
		this.renderable.setCurrentAnimation(this.varAnimacion,(function () {
			
			
			this.direccion*=-1;
			this.volteado=false;
			this.varAnimacion="andando_"+this.enfadado;
			this.renderable.setCurrentAnimation(this.varAnimacion);	
			this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT   | me.collision.types.ENEMY_OBJECT);
			this.vecesRetroceder++;			
			
			return false; 
				
		}).bind(this));
		// var _this=this.body;
		 // me.timer.setTimeout(function () {
			 // _this.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT   | me.collision.types.ENEMY_OBJECT);
			
		// },1000);
	},
	onEmpujar:function(dirPersonaje){
			me.audio.play("empujado",false,null,0.1);
			me.timer.clearInterval(this.timer);
			this.body.setCollisionMask(me.collision.types.NO_OBJECT);
			this.body.vel.y=-200;
					
			this.body.vel.x=this.body.accel.x*0.8* me.timer.tick*dirPersonaje;
		
			
		
	},
	onVuelta: function(direccion,punch){
		me.audio.play("enemigoGolpeado",false,null,0.05);
		var contador=this.levantar;
		if(this.invulnerable)
			return false;
		
		if(this.volteado)
		{
				this.body.vel.y=-this.body.maxVel.y;
				this.renderable.flipY(false);
				this.volteado=false;
				me.timer.clearInterval(this.timer);
				
			//-- Si vuelves a darle desde abajo se enfadara
			if(!punch){
				
				if(this.enfadado<2){
					this.enfadado+=1;
					this.potencia+=0.3;
				}
					
				else{
					this.enfadado=0;
					this.potencia=0.3;
				}
					
				
				this.varAnimacion="andando_"+this.enfadado;
				this.renderable.setCurrentAnimation(this.varAnimacion);	
			}
			
			
			return false;
			
		}
		
		
		this.body.vel.y=-this.body.maxVel.y;
	
		this.body.vel.x=this.body.accel.x * 0.5 * me.timer.tick * direccion;
		//Le damos la vuelta cuando el enemigo sea empujado por el bloque
		this.renderable.flipY(true);
		// this.body.setCollisionMask(me.collision.types.WORLD_SHAPE);
		this.volteado=true;
		
		//Hará un pequenno movimiento cada x tiempo, si el contador llega a 0
		// se podrá derecho y volverá a andar pero con mayor velocidad
		
		var _this = this;
		var tembleque=2.080;
		
		this.timer = me.timer.setInterval(function () {
			
			contador -=1;
			if(contador<10 && contador>0)
			{
							
				tembleque*=-1;
				_this.pos.x+=tembleque;
				
				
			}
			else if(contador<=-1)
			{
				_this.renderable.flipY(false);
				_this.volteado=false;
				
				if(_this.enfadado<2){
					
					_this.enfadado+=1;
					_this.potencia+=0.3;
				}
				else{
					_this.enfadado=0;
					_this.potencia=0.3;
					
				}
				
				_this.varAnimacion="andando_"+_this.enfadado;
				_this.renderable.setCurrentAnimation(_this.varAnimacion);		
				_this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT   | me.collision.types.ENEMY_OBJECT);
				contador=_this.levantar;
				
				me.timer.clearInterval(_this.timer);
			}
				
		}, _this.bucleTiempo);
	},
	onVisibilidad:function(){
		
		if(!this.inViewport){
			
			if(this.pos.y>me.video.renderer.getHeight())
			{
				me.game.world.removeChild(this);
			}
			
			if(this.pos.x+this.width< 0)
			{
				
				this.pos.x=me.video.renderer.getWidth();
				
			}
			else if(this.pos.x> me.video.renderer.getWidth()){
				this.pos.x=0;
				
			}
			
		}
	},
	onDeactivateEvent: function () {
		me.timer.clearInterval(this.timer);
		game.data.contadorEnemigos--;
		game.data.contadorMonedas++;
	},
	onTuberia:function(other){
		
		if (!this.sonidoUnaVez) {
			this.sonidoUnaVez = true;
			me.audio.play("tuberia",false,null,0.05);
		}
		var boundsA = this.getBounds();
		var boundsB = other.getBounds();
		this.invulnerable=true;
		
		this.body.setVelocity(1,0);
		
		this.body.setCollisionMask(me.collision.types.WORLD_SHAPE);
		
	
	   //Sale desde la tuberia de arriba cuando entre y deje de colisionar con la de abajo
		if (boundsA.left < boundsB.left && !other.miraIzq) {
			this.onSalirPorTuberia(other.identificador);
			
		}
		 //Sale desde la tuberia de arriba cuando entre y deje de colisionar  con la de abajo
		else if (boundsA.right > boundsB.right && other.miraIzq) {
			this.onSalirPorTuberia(other.identificador);
		}
	},
	onMoverse:function(){
		
		this.body.vel.x=this.body.accel.x*me.timer.tick*this.potencia*this.direccion;
	}
	
});
game.Pinchos = game.Enemigo.extend({
    init: function (x,y,settings) {
		
		this.bucleTiempo=100;
		
		this.levantar=50;
		this.enfadado=0;
	
        this._super(game.Enemigo, "init", [x,y,{
			
			// image:'pinchos',
			width:25,
			height:20,
			framewidth:25,
			frameheight:20,
			direccion:settings.direccion,
			
		}]);
		
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 20, 15));
		
		this.body.setVelocity(2,3);
		this.body.setMaxVelocity(10,3);
		this.body.setFriction(0.020,0);
		
		this.almacenVelX=this.body.accel.x;	
		this.almacenVelY=this.body.accel.y;	
		
		this.renderable = game.texture.createAnimationFromName([
            "pinchos_0.png", "pinchos_1.png", "pinchos_2.png",
            "pinchos_3.png", "pinchos_4.png", "pinchos_5.png",
            "pinchos_a0.png", "pinchos_a1.png", "pinchos_a2.png",
			"pinchos_a3.png","pinchos_a4.png","pinchos_a5.png","pinchos_v0.png","pinchos_v1.png",
			"pinchos_v2.png","pinchos_v3.png","pinchos_v4.png","pinchos_v5.png"
           
        ]);
		
		this.renderable.addAnimation("andando_0", [0,1,2], 200);
		this.renderable.addAnimation("andando_1", [6,7,8], 200);
		this.renderable.addAnimation("andando_2", [12,13,14], 200);
		this.renderable.addAnimation("cambiarDir_0", [3,4,5], 200);
		this.renderable.addAnimation("cambiarDir_1", [9,10,11], 200);
		this.renderable.addAnimation("cambiarDir_2", [15,16,17], 200);
		
		this.renderable.setCurrentAnimation("andando_0");
		
		
    },
	
	update: function (time) {
		
				
		return this._super(game.Enemigo, "update", [time]);
	
	},
	
	
});
game.Cangrejos = game.Enemigo.extend({
    init: function (x,y,settings) {
		
		this.bucleTiempo=100;
		this.levantar=50;
		this.enfadado=0;
		this.medioEnfado=0;
		this.potencia=0.3;
        this._super(game.Enemigo, "init", [x,y,{
			
			// image:'cangrejos',
			width:25,
			height:25,
			framewidth:25,
			frameheight:25,
			direccion:settings.direccion,
			
		}]);
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 20, 20));
		
		this.body.setVelocity(2.8,3);
		this.body.setMaxVelocity(10,3);
		this.body.setFriction(0.020,0);
		
		this.almacenVelX=this.body.accel.x;	
		this.almacenVelY=this.body.accel.y;	
		
		this.renderable = game.texture.createAnimationFromName([
            "cangrejos_0.png", "cangrejos_1.png","cangrejos_2.png",
            "cangrejos_3.png", "cangrejos_4.png","cangrejos_5.png","cangrejos_6.png",
            "cangrejos_a0.png", "cangrejos_a1.png", "cangrejos_a2.png","cangrejos_a3.png",
			"cangrejos_a4.png","cangrejos_a5.png","cangrejos_a6.png",
			"cangrejos_v0.png","cangrejos_v1.png","cangrejos_v2.png","cangrejos_v3.png",
			"cangrejos_v4.png","cangrejos_v5.png","cangrejos_a6.png"
           
        ]);
		
		
		
		this.renderable.addAnimation("andando_0", [0,1], 200);
		this.renderable.addAnimation("andando_01", [2,3], 200);
		this.renderable.addAnimation("andando_1", [7,8], 200);
		this.renderable.addAnimation("andando_11", [9,10], 200);
		this.renderable.addAnimation("andando_2", [14,15], 200);
		this.renderable.addAnimation("andando_21", [16,17], 200);
		this.renderable.addAnimation("cambiarDir_0", [4,5,6], 200);
		this.renderable.addAnimation("cambiarDir_1", [11,12,13], 200);
		this.renderable.addAnimation("cambiarDir_2", [18,19,20], 200);
		
		this.renderable.setCurrentAnimation("andando_0");
		
		
    },
	onVuelta: function(direccion,punch)
	{
		me.audio.play("enemigoGolpeado",false,null,0.3);
		var contador=this.levantar;
		if(this.invulnerable)
			return false;
		
		if(this.volteado){
			
				
				this.body.vel.y=-this.body.maxVel.y;
				this.renderable.flipY(false);
				this.volteado=false;
				me.timer.clearInterval(this.timer);
				
			//-- Si vuelves a darle desde abajo se enfadara
			if(!punch){
				
				if(this.enfadado<2){
					this.potencia+=0.3;
					this.enfadado+=1;
				}
					
				else{
					this.potencia=0.3;
					this.enfadado=0;
				}
					
				
				this.varAnimacion="andando_"+this.enfadado;
				this.renderable.setCurrentAnimation(this.varAnimacion);	
			}
			
			
			return false;
			
		}
		this.body.vel.y=-this.body.maxVel.y;
		this.body.vel.x=this.body.accel.x * 0.5 * me.timer.tick * direccion;
		
		
		if(this.medioEnfado==0){
			
				this.medioEnfado++;
				this.varAnimacion="andando_"+this.enfadado+this.medioEnfado;
				this.renderable.setCurrentAnimation(this.varAnimacion);	
				
				return false;
		}
		else{
			
			this.medioEnfado=0;
			this.renderable.flipY(true);
			this.volteado=true;
		
				
			var _this = this;
			var tembleque=2.080;
			
			this.timer = me.timer.setInterval(function () {
				
				contador -=1;
				if(contador<10 && contador>0)
				{
								
					tembleque*=-1;
					_this.pos.x+=tembleque;
					
					
				}
				else if(contador<=-1)
				{
					_this.renderable.flipY(false);
					_this.volteado=false;
					
					if(_this.enfadado<2){
						_this.potencia+=0.3;
						_this.enfadado+=1;
					}
						
					else{
						_this.potencia=0.3;
						_this.enfadado=0;
					}
					
					_this.varAnimacion="andando_"+_this.enfadado;
					_this.renderable.setCurrentAnimation(_this.varAnimacion);		
					_this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT   | me.collision.types.ENEMY_OBJECT);
					contador=_this.levantar;
					
					me.timer.clearInterval(_this.timer);
				}
					
			}, _this.bucleTiempo);
		}
		
	},
	update: function (time) {
		
				
		return this._super(game.Enemigo, "update", [time]);
	
	},
	
	
	
});
game.Moscas = game.Enemigo.extend({
    init: function (x,y,settings) {
		
		this.bucleTiempo=100;
		
		this.direccion=1;
		this.levantar=50;
		this.enfadado=0;
		this.maxSalto=15;
        this._super(game.Enemigo, "init", [x,y,{
			
			// image:'moscas',
			width:19,
			height:19,
			framewidth:19,
			frameheight:19,
			direccion:settings.direccion
			
		}]);
		
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 20, 19));
		
		this.body.setVelocity(4,1.3);
		this.body.setMaxVelocity(8,1.8);
		this.body.setFriction(0.070,0);
		this.body.gravity=0.1
		this.almacenVelX=this.body.accel.x;	
		this.almacenVelY=this.body.accel.y;	
		
		this.renderable = game.texture.createAnimationFromName([

            "moscas_0.png", "moscas_1.png",
            "moscas_a0.png", "moscas_a1.png",
			"moscas_v0.png","moscas_v1.png"
			
           
        ]);
		
		this.renderable.addAnimation("andando_0", [0,1], 200);
		this.renderable.addAnimation("andando_1", [2,3], 200);
		this.renderable.addAnimation("andando_2", [4,5], 200);
		this.renderable.addAnimation("cambiarDir_0", [0,1], 200);
		this.renderable.addAnimation("cambiarDir_1", [2,3], 200);
		this.renderable.addAnimation("cambiarDir_2", [4,5], 200);
		
		this.renderable.setCurrentAnimation("andando_0");
		
		
    },
	
	update: function (time) {
		
				
		return this._super(game.Enemigo, "update", [time]);
	
	},
	onMoverse:function(){
		this.maxSalto--;
		if(this.maxSalto>0)
		{
			this.body.vel.y=-this.body.accel.y*me.timer.tick;
			this.body.vel.x=this.body.accel.x*me.timer.tick*this.potencia*this.direccion;
			
		}
		else if(this.maxSalto<-150 && !this.invulnerable){
			this.maxSalto=15;
		
		}
		else  if(this.invulnerable)
			this.body.vel.x=this.body.accel.x*me.timer.tick*this.potencia*this.direccion;
			
		
			
	},
	
	
});
game.Tortugas = game.Enemigo.extend({
    init: function (x,y,settings) {
		
		
		this.varAnimacion="";
		this.bucleTiempo=100;
	
		this.tipo="tortuga";
		this.levantar=50;
		this.enfadado=0;
		this._super(game.Enemigo, "init", [x,y,{
			
			// image:'tortugas',
			width:17,
			height:25,
			framewidth:17,
			frameheight:25,
			direccion:settings.direccion
			
		}]);
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 20, 25));
		
		if(settings.resta!=null)
			this.body.vel.set(settings.resta*0.5,-2);
		
		this.body.setVelocity(2,7);
		this.body.setMaxVelocity(10,7);
		this.body.setFriction(0.070,0);
		
		
		this.almacenVelX=this.body.accel.x;	
		this.almacenVelY=this.body.accel.y;	
		
		this.renderable = game.texture.createAnimationFromName([
            "tortuga_0.png", "tortuga_1.png","tortuga_2.png",
            "tortuga_3.png", "tortuga_4.png","tortuga_5.png","tortuga_6.png"
			
            
        ]);
		
		this.renderable.addAnimation("andando_0", [0,1], 200);
		this.renderable.addAnimation("cambiarDir_0", [2,3,4], 200);
		
		
		this.renderable.setCurrentAnimation("andando_0");
	
    },
	
	update: function (time) {
			
		return this._super(game.Enemigo, "update", [time]);
		
	},
	
	onDeactivateEvent: function () {
		me.timer.clearInterval(this.timer);
	},
	onCollision: function (res, other) {
		switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
				
				res.overlapV.x=0;
				
				if(other.type==="vuelta" && other.subido)
				{
					var boundsA = this.getBounds();
                    var boundsB = other.getBounds();
					var resta=~~(boundsA.left-boundsB.left);
					
					if(resta<0)
						resta=-this.body.accel.x;
					else
						resta=this.body.accel.x;
					
					me.game.world.addChild(me.pool.pull("caparazones",this.pos.x,this.pos.y-5,{animacion:"normalReves",varAnimacion:"movimientoReves",renacer:"renacerReves",resta:resta}));
					
					me.audio.play("enemigoGolpeado",false,null,0.3);
					
					me.game.world.removeChild(this);
					return true;
				
				}
				else if (other.type==="tuberia") {
					
				  this.invulnerable=true;
                  if(other.destino!="salida")
						this.onTuberia(other);
					
                   return false;
				}
				else if(other.type==="reActivar")
				{
				 
					this.tocoTuberia=false;
					this.invulnerable=false;
					this.vecesRetroceder=0;
					this.body.setVelocity(this.almacenVelX,this.almacenVelY);
					this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT  | me.collision.types.ENEMY_OBJECT);
					
				 
				
					return false;
				}
			// return true;
			break;
			case me.collision.types.PLAYER_OBJECT:
				if(res.overlapV.y <0 &&  other.body.falling)
				{
					other.body.vel.y = -other.body.maxVel.y  * me.timer.tick;
					me.game.world.addChild(me.pool.pull("caparazones",this.pos.x,this.pos.y+10,{animacion:"normal",varAnimacion:"movimiento",renacer:"renacer",resta:null}));
					me.audio.play("enemigoGolpeado",false,null,0.3);
					me.game.world.removeChild(this);
				}
				else if(res.overlapV.x!=0 && !this.invulnerable)
					other.hurt();
				
					
			return false;
			break;
			
			case me.collision.types.ENEMY_OBJECT:
				this.body.vel.x=0;
				if(!this.volteado && this.vecesRetroceder<3){
					
					this.onRetroceder();
				}
					
					
			return false;
			break;
			
			default:false;
			
			
			
		}
	},
	onVuelta:function(direccion,punch){
		
		var resta;
		
		if(this.direccion<0)
			resta=-this.body.accel.x;
		else
			resta=this.body.accel.x;
		
		me.game.world.addChild(me.pool.pull("caparazones",this.pos.x,this.pos.y-5,{animacion:"normalReves",varAnimacion:"movimientoReves",renacer:"renacerReves",resta:resta}));
		me.audio.play("enemigoGolpeado",false,null,0.3);
		me.game.world.removeChild(this);
	},
	
	
});
game.Caparazones= game.Enemigo.extend({
    init: function (x,y,settings) {
		
	
		//animacion,varAnimacion,renacer,resta,direccion
        this._super(game.Enemigo, "init", [x,y,{
			
			// image:'caparazones',
			width:20,
			height:14,
			framewidth:20,
			frameheight:14,
			direccion:settings.direccion
			
		}]);
		
		
		this.animacion=settings.animacion;
		this.varAnimacion=settings.varAnimacion;
		this.renacer=settings.renacer;
		this.volteado=true;
		this.potencia=1;
		this.caparazoneado=false;
		this.bucleTiempo=100;
		this.tipo="tortuga";
		this.levantar=50;
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 17, 14));
		this.body.setFriction(0.020,0);
		this.body.gravity=0.20;
		
		this.almacenVelX=this.body.accel.x;	
		this.almacenVelY=this.body.accel.y;	
		
		this.renderable = game.texture.createAnimationFromName([
            "caparazon_0.png", "caparazon_1.png","caparazon_2.png",
            "caparazon_3.png", "caparazon_4.png","caparazon_5.png","caparazon_6.png",
			"caparazon_7.png", "caparazon_8.png","caparazon_9.png"
            
        ]);
		
		this.renderable.addAnimation("normalReves", [0]);
		this.renderable.addAnimation("normal", [9]);
		this.renderable.addAnimation("renacerReves", [0,1],100);
		this.renderable.addAnimation("renacer", [8,9],100);
		this.renderable.addAnimation("movimientoReves", [2,3,4],100);
		this.renderable.addAnimation("movimiento", [5,6,7],100);
		
		if(settings.resta!=null)
			this.body.vel.set(settings.resta*0.3,-2);
		
		this.body.setVelocity(2,7);
		this.body.setMaxVelocity(10,7);
		this.renderable.setCurrentAnimation(this.animacion);
		this.onRestablecer();
		
		
    },
	
	update: function (time) {
		
		
		if(this.caparazoneado)
			this.onMoverse();
		
		return this._super(game.Enemigo, "update", [time]);
	
	},
	
	
	onEmpujar:function(dirPersonaje)
	{	
			me.timer.clearInterval(this.timer);
			this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
			this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.ENEMY_OBJECT);
			
			this.caparazoneado=true;
			
			
			var _this=this;
			this.timer = me.timer.setTimeout(function () {
				
				//Con este micro segundo conseguimos que Mario pueda ser dannado.
				_this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.ENEMY_OBJECT | me.collision.types.PLAYER_OBJECT);	
			}, 200);
			
			this.renderable.setCurrentAnimation(this.varAnimacion);
			this.direccion=dirPersonaje;
			
			
		
	},
	onCollision: function (res, other) {
		switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
				
				res.overlapV.x=0;
				
				if(other.type==="vuelta" && other.subido)
				{
					this.onVuelta(null,null);
				
					return true;
					
				
				}
				else if(other.type==="tuberia")
				{
					if(other.destino!="salida")
						this.onTuberia(other);
					
					return false;
					
				}
			
			break;
			case me.collision.types.PLAYER_OBJECT:
				if(res.overlapV.y <0 &&  other.body.falling)
				{
					other.body.vel.y = -other.body.maxVel.y  * me.timer.tick;
					this.body.vel.x=0;
					this.onRestablecer();
					this.caparazoneado=false;
					this.renderable.setCurrentAnimation(this.animacion);
					
					
				}
				else if(res.overlapV.x!=0){
					
					if(this.caparazoneado){
						other.hurt();
						return false;
					}
						
					else{
						var boundsA = this.getBounds();
						var boundsB = other.getBounds();
						var resta=~~(boundsA.left-boundsB.left);
						if(resta<0)
							this.onEmpujar(-1);
						else
							this.onEmpujar(1);
						
						return true;
					}
					
				
				}
					
				
			return false;
			break;
			
			default:
			return false;
			
			
			
		}
	},
	onVuelta:function(direccion,punch){
		
		this.resta=2;
		me.game.world.removeChild(this);
	},
	
	
	onRestablecer:function(){
		
		var contador=this.levantar;
		var _this = this;
		var tembleque=2.080;
		me.timer.clearInterval(this.timer);
		
		this.timer = me.timer.setInterval(function () {
			
			contador -=1;
			if(contador<10 && contador>0){
							
				tembleque*=-1;
				_this.pos.x+=tembleque;
				_this.renderable.setCurrentAnimation(_this.renacer);		
				
				
			}
			else if(contador<=-1){
				this.resta=null;
				me.game.world.removeChild(_this);
			
			}
				
		}, _this.bucleTiempo);
	},
	onSalirPorTuberia:function(id){
		for(var i=0;i<game.data.tuberiasArray.length;i++)
		{
			
			if(game.data.tuberiasArray[i].identificador==id && game.data.tuberiasArray[i].destino=="salida")
			{
				// this.body.gravity=0;
				this.pos.x=game.data.tuberiasArray[i].pos.x;
				this.pos.y=game.data.tuberiasArray[i].pos.y+20;
				me.game.world.removeChild(this);
				
				break;
			}
		}
	},
	onDeactivateEvent: function () {
		
		me.game.world.addChild(me.pool.pull("tortugas",this.pos.x,this.pos.y-20,{resta:this.resta,direccion:this.direccion}));		
		me.timer.clearInterval(this.timer);
	}
	
});
game.Bloque = me.Entity.extend({
    init: function (x,y,settings) {
		this.subido=false;
		
		var mascaraW = settings.width || settings.framewidth;
		var mascaraH = settings.height || settings.frameheight;
		
		
        this._super(me.Entity, "init", [x, y, {
            width:16,
			height:16,
			type:settings.type,
			image:'bloque'
        }]);
		
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, mascaraW, mascaraH));
		this.body.collisionType = me.collision.types.WORLD_SHAPE;
		
		
		
    },
	onSubirBloque:function()
	{
		var _this=this;
		this.pos.y-=3;
		
		this.subido=true;
		
		this.timer = me.timer.setTimeout(function () {
					
				_this.pos.y+=3;
				_this.subido=false;
				
				
		}, 200);
	},
	
	
});
game.Tuberia = me.Entity.extend({
    init: function (x,y,settings) {

		this.identificador=settings.identificador;
		this.destino=settings.destino;
		this.miraIzq=settings.miraIzq;
		
		var mascaraW = settings.width || settings.framewidth;
		var mascaraH = settings.height || settings.frameheight;
		
        this._super(me.Entity, "init", [x, y, {
            image: "tuberia",
			width:32,
			height:31,
			type:settings.type,
			name:settings.name,
			
        }]);
		
		this.renderable.flipX(this.miraIzq);
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, mascaraW, mascaraH));
		
		this.body.collisionType = me.collision.types.WORLD_SHAPE;
		this.anchorPoint.set(settings.movShapeX || 0, settings.movShapeY || 0);
		
		
    },
	
	
	
});
game.Boo = me.Entity.extend({
    init: function (x,y,settings) {
		var rutaH = me.video.renderer.getWidth()-40;
		var rutaV = 25;
		
	
		this.activar=false;
        this._super(me.Entity, "init", [x, y, {
           
			width:15,
			framewidth:15,
			height:15,
			frameheight:15,
			z:4,
			
			
        }]);
		this.walkLeft = false;
		this.subirTop=false;
		
		this.startY = this.pos.y;
		this.endY=this.pos.y + rutaV;
		
		this.startX = this.pos.x - rutaH;
		this.endX   = this.pos.x + rutaH;
		
		
		this.body.setVelocity(1,0.5);
		this.body.gravity=0;
		
		
		this.body.setCollisionMask(me.collision.types.NO_OBJECT);
		
		this.renderable = game.texture.createAnimationFromName([
            "boo_0.png", "boo_1.png","boo_2.png",
            "boo_3.png", "boo_4.png","boo_5.png","boo_6.png","boo_7.png"
			            
        ]);
		this.renderable.addAnimation("inicio",[0,1,2,3,0,1,2,3,4,5],200);
		this.renderable.addAnimation("final",[1,2,3,4,5],200);
		this.renderable.addAnimation("atacar",[6,7],100);
		this.renderable.flipX(true);
		this.renderable.setCurrentAnimation("inicio",(function () {
			
			this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
			this.activar=true;
			this.renderable.setCurrentAnimation("atacar");				
			return false; 
				
		}).bind(this));
		
			
		this.body.collisionType = me.collision.types.ENEMY_OBJECT;
		this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
		
    },
	update:function(time){
		
		this._super(me.Entity, "update", [time]);
		
		if (this.walkLeft && this.pos.x <= this.startX) {
			
			this.activar=false;
			this.walkLeft = false;
			this.renderable.setCurrentAnimation("final",(function () {
			
			this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
			
			me.game.world.removeChild(this);		
			return false; // do not reset to first frame
				
			}).bind(this));
		} else if (!this.walkLeft && this.pos.x >= this.endX) {
			
			this.activar=false;
			this.walkLeft = true;
			this.renderable.setCurrentAnimation("final",(function () {
			
			this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
			
			me.game.world.removeChild(this);		
			return false; // do not reset to first frame
				
			}).bind(this));
		}
		if (this.subirTop && this.pos.y <= this.startY) {
			
			this.subirTop = false;
			
		} else if (!this.subirTop && this.pos.y >= this.endY) {
			
			this.subirTop = true;
		}
		if(this.activar)
		{
			this.body.vel.x = (this.walkLeft) ? -this.body.accel.x * me.timer.tick : this.body.accel.x * me.timer.tick;
			this.body.vel.y = (this.subirTop) ? -this.body.accel.y * me.timer.tick : this.body.accel.y * me.timer.tick;
		}
		
		else
		{
			this.body.vel.x=0;
			this.body.vel.y=0;
		}
			
		
		this.body.update(time);
				
		return true;
	},
	
		
	
	
});
game.Seta = me.Entity.extend({
    init: function (x,y,settings) {

		this.direccion=settings.direccion || 1;
		this.tipoSeta=settings.tipoSeta || 0;	
		this.contacto=false;
		
		
        this._super(me.Entity, "init", [x, y, {
           	width:16,
			framewidth:16,
			height:16,
			frameheight:16,
			z:4,
			
			
        }]);
		this.alwaysUpdate=true;
		this.body.setVelocity(1,3);
		this.body.gravity=1;
		this.renderable = game.texture.createAnimationFromName([
            "seta_0.png", "seta_1.png"
          
        ]);
		this.renderable.addAnimation("animacion",[this.tipoSeta],0);
		this.renderable.setCurrentAnimation("animacion");
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 16, 16));
		
		this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;
		this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT);
		
    },
	update:function(time){
		
		this.onVisibilidad();
		this.body.vel.x=this.body.accel.x*this.direccion*me.timer.tick;
		
		this.body.update(time);
		me.collision.check(this);
		
		return true;
	},
	onCollision: function (res, other) {
		switch (other.body.collisionType) {
           case me.collision.types.WORLD_SHAPE:
				res.overlapV.x=0;
				if(other.type=="tuberia" || other.type==="reActivar")
					return false;
			
			return true;
			break;
			case me.collision.types.PLAYER_OBJECT:
			
				this.body.setCollisionMask(me.collision.types.NO_OBJECT);
				//Si la seta is buena que se agrande el jugador
				if(this.tipoSeta==0  && other.toques<2)
				{
					other.onAgrandar();
					game.data.contadorSetas=0;
					
				}
				else if(this.tipoSeta==1){
				//De lo contrario obtendremos la posicion de ambos jugadores
				//Guardaremos unicamente los valores del primer jugador, de esta forma serán absolutos 
				//
				
					game.data.jugadores=me.game.world.getChildByName("jugador");				
					var posicionX=game.data.jugadores[0].pos.x;
					var posicionY=game.data.jugadores[0].pos.y;
					
					
					game.data.jugadores[0].pos.x=game.data.jugadores[1].pos.x;
					game.data.jugadores[0].pos.y=game.data.jugadores[1].pos.y;
					game.data.jugadores[1].pos.x=posicionX;
					game.data.jugadores[1].pos.y=posicionY;
					
					game.data.contadorSetasMalas=0;
					
				}
				me.game.world.removeChild(this);
			return false;
			break;
			
			default:
			return false;
		}
	},
	onVisibilidad:function(){
		
		if(!this.inViewport){
				
			if(this.pos.y>me.video.renderer.getHeight())
				me.game.world.removeChild(this);
			if(this.pos.x+this.width< 0)
				this.pos.x=me.video.renderer.getWidth();
			else if(this.pos.x> me.video.renderer.getWidth())
				this.pos.x=0;
			
			
		}
	}
		
	
	
});
game.Punch = me.Entity.extend({
    init: function (x,y) {
		this.vidas=3;
		
        this._super(me.Entity, "init", [x, y, {
            width:20,
            framewidth:20,
			height:19,
			frameheight:19,
			type:'punch',
        }]);
		
		
		this.body.removeShapeAt(0);
		this.body.addShape(new me.Rect(0, 0, 20, 19));
		this.body.collisionType = me.collision.types.ACTION_OBJECT;
		this.renderable = game.texture.createAnimationFromName([
            "punch_0.png", "punch_1.png", "punch_2.png"
          
        ]);
		this.renderable.addAnimation("gigante",[0]);
		this.renderable.addAnimation("normal",[1]);
		this.renderable.addAnimation("pequenno",[2]);
		this.renderable.setCurrentAnimation("gigante");
				
		
    },
	update:function(time)
	{
		if(this.vidas<=0)
			me.game.world.removeChild(this);
		else if(this.vidas==2)
			 this.renderable.setCurrentAnimation("normal");
		 else if(this.vidas==1)
			  this.renderable.setCurrentAnimation("pequenno");
		
		return true;
	},
	onPulsado:function()
	{
		me.audio.play("punch",false,null,0.05);
		this.vidas--;
		var arrayVolteados= me.game.world.getChildByName("enemigo");
		for(var i=0;i<arrayVolteados.length;i++)
			if(arrayVolteados[i].body.vel.y==0)
			arrayVolteados[i].onVuelta(true,true);
		
		// alert(me.game.viewport.bounds);
		me.game.viewport.pos.y-=3;
		this.timer = me.timer.setTimeout(function () {
			me.game.viewport.pos.y+=3;
			
		}, 100);
		// me.game.viewport.move(20,3);
	}
	
	
});

