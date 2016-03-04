'use strict';
var Peer = require('./peer.js');
//TRACKER TO INTIALIZE SWARM


var tracker = new Peer.Peer('Nork Tracker', 3000);
tracker.start();