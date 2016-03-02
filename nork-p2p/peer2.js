'use strict';
var Peer = require('./peer.js');
//TRACKER TO INTIALIZE SWARM
var tracker = {
    host: '127.0.0.1',
    port: 3000
}

var peer2 = new Peer.Peer('peer2', 3002);
peer2.start();
peer2.connect(tracker);