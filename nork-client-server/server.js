'use strict';


const game = require('./game.js'),// import game client
    net = require('net'), //import socket module
    server = net.createServer(); //create socket server

//notify (via observer!) when a a connection occurs
server.on('connection', function(socket) {

    //we've established a socket to use

    //send a message to the socket
    socket.write('connected on: ' + socket.remoteAddress +':'+ socket.remotePort +'\n');
    socket.write('starting game \n');
    // invoke game kick off method
    
    socket.write(game.play());
    
    
    
    // handle data events by interacting with the game logic
    socket.on('data', function(data) {
    
        var input = data.toString().toLowerCase();
        
        //call input() on the game logic
        // and output to the socket what the game returns     
        socket.write(game.input(input));
        
        // then check endgame and exit
        // set a timer of 100 ms because async function calls -- "reasons"
        setTimeout(function(){
            if(game.status !== undefined){
                server.close();

            }
        }, 100);
        
        

    });
    
    // handle if the client closes the connection
    socket.on('close', function(){
        console.log('client disconnected');
        console.log('closing server');
        server.close();
    });
});
                            
//when we start "listening" for connections
server.on('listening', function() {
    //get address info
    var addr = server.address();

    //print the info
    console.log('server listening on port %d', addr.port);  
});

server.listen(3000); //listen on port 3000




