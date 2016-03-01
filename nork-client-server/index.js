'use strict';


const game = require('./game.js'),// import game client
    net = require('net'), //import socket module
    server = net.createServer(); //create socket server

//notify (via observer!) when a a connection occurs
server.on('connection', function(socket) {

    //we've established a socket to use

    //send a message to the socket
    socket.write('connected: ' + socket.remoteAddress +':'+ socket.remotePort +'\n');
    
    socket.on('data', function(data) {
    
        var echo = data.toString().toLowerCase();
    
        if(echo === 'exit'){
            socket.write('disconnected');
            socket.end();
        }else {
            // INTERACT with game here
            
            socket.write("Did you say '"+echo+"'?");
        }
    
    });
    
    socket.on('close', function(){
        console.log('connection closed');
        process.exit(0);
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





