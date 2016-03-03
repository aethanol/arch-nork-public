'use strict';
var Peer = require('./peer.js');
//TRACKER TO INTIALIZE SWARM
var tracker = {
    username: 'Nork Tracker',
    host: '127.0.0.1',
    port: 3000
}

var peer1 = new Peer.Peer('peer1', 3001);
peer1.start();
peer1.connect(tracker);