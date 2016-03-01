'use strict';

//make the client
const net = require('net'),
    readline = require('readline'),
    client = new net.Socket();
    

client.on('data', function(data) { //when we get data
    console.log("Received: "+data); //output it
});

// client.on('close', function() { //when connection closed
//     console.log('Connection closed');
//     process.exit(0);
// });


var HOST = '127.0.0.1';
var PORT = 3000;

//connect to the server
client.connect(PORT, HOST, function() {
    console.log('Connected to: ' + HOST + ':' + PORT);

});

const io = readline.createInterface(process.stdin, process.stdout);

io.setPrompt('> ');
io.prompt();

io.on('line', function(line){
    // switch(line.trim()) {
    // case 'exit':
    //     console.log('Have a great day!');
    //     process.exit(0);
    //     break;
    // default:
    //     client.write(line);
    //     break;
    // }
    client.write(line);
    io.prompt();
}).on('close', function() {
    client.destroy();
    console.log('Have a great day!');
    process.exit(0);
});

