'use strict';
var Peer = require('./peer.js');
var Game = require('./game.js');

var tracker = new Peer.Peer('Nork Tracker', 3000);
tracker.start();

// create the peers
var game = new Game.Game();
var game2 = new Game.Game();
var game3 = new Game.Game();

//third peer connects
setTimeout(function(game) {
    game.connect('Joel', 3012);
    setTimeout(function(game) {
        game._ui._mimicIO('chat hey yall');
    }, 1500, game);
}, 1000, game3);

// first peer conncts
setTimeout(function(game) {
    game.connect('Liam', 3010);
    setTimeout(function(game) {
        game._ui._mimicIO('chat hey Joel!');
    }, 2000, game);
    setTimeout(function(game) {
        game._ui._mimicIO('alert NEED MORE PYLONS!');
    }, 3500, game);
}, 1000, game);

// second peer connects
setTimeout(function(game) {
    game.connect('Ethan', 3011);
}, 1200, game2);



setTimeout(function(game, game2, game3) {
    game._ui._mimicIO('brief');
    game2._ui._mimicIO('brief');
    game3._ui._mimicIO('brief');
}, 7000, game, game2, game3);