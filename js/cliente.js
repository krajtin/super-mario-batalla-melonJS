var cliente={
	
	socket:null,
	conexion:function()
	{
		cliente.socket=io();
		
		cliente.socket.on('crearJugador', function(numero){
			
			game.crearJugador(numero);
		});
		
		cliente.socket.on('asignarLetras', function(numero){
			
			game.asignarLetras(numero);
		});
				
		cliente.socket.on('moverJugador', function(x,n){
			
			game.moverJugador(x,n);
			
		});		
		cliente.socket.on('finJuego', function(){
			
			game.finJuego();
			
		});	
		cliente.socket.on('gameEnd', function(gameEnd){
			
			game.gameEnd(gameEnd);
			
		});	
		cliente.socket.on('empezarJuego', function(){
			
			game.empezarJuego();
			
		});		
		
		
	}
	
}