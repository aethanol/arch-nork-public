'use strict';
var Peer = require('./peer.js');
//TRACKER TO INTIALIZE SWARM
var tracker = {
    username: 'Nork Tracker',
    host: '127.0.0.1',
    port: 3000,
    connectionString: '127.0.0.1:3000'
}

var peer3 = new Peer.Peer('peer3', 3003);
peer3.start();
peer3.connect(tracker);
// setTimeout(function() {
//     peer3.close();
// }, 5000);
