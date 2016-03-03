'use strict';
const net = require('net'); //import socket module
const readline = require('readline');
const events = require('events');
var clone = require('clone');

class Peer {
    constructor(name, port){
        this._name = name;
        this._port = port;
        this._host = '127.0.0.1'
        this.connectionString = this._host + ":" + this._port;
        this._server = net.createServer(); //create socket server
        this._swarm = [];
        this._connections = [];
        Peer.prototype.__proto__ = events.EventEmitter.prototype;
        events.EventEmitter.call(this);
        // this._emitter = new events.EventEmitter();
        // this._request = serverBehavior;
        // this._process = clientBehavior;
    }

    start() {
        var self = this;
        this.server.listen(this._port, function(){
             self.addr = self.server.address();
            console.log('server listening on port %d', self.addr.port);
        });

        this.server.on('connection', function(socket) {
            console.log("a peer has connected.");
            // socket.write('connected: ' + socket.remoteAddress +':'+ socket.remotePort +'\n');
            self._initSocket(socket);
        });
    }

    connect(peer) {
        //connect to a peer
        var socket = new net.Socket();
        var self = this;
        socket.connect(peer.port, peer.host, function() {
            console.log('Connected to: ' + peer.host + ':' + peer.port);
            if(self._addToSwarm(peer)){
                peer.socket = socket;
                self._addConnection(peer);
            }

            var credentials = {
                username: self._name,
                host: self._host,
                port: self._port
            }

            var message = {
                command: 'add',
                data: credentials
            }
            socket.write(JSON.stringify(message));
            setTimeout(function() {
                socket.write(JSON.stringify({command: 'getSwarm', data: ''}));
            }, 100);
        });
        this._initSocket(socket);
    }

    _process(data, socket) {
        var line = data.toString().trim();
        line = JSON.parse(line);
        var command = line.command;
        var lineData = line.data;

        if(command === 'exit'){
            console.log('disconnected');
            socket.end();
        }else if (command === 'add') {
            var peer = lineData;
            console.log(peer);
            if(this._addToSwarm(peer)) {
                peer.socket = socket;
                if(this._addConnection(peer)) {
                    console.log("peer " + peer.username + " added successfully");
                    console.log("swarm length: " + this._swarm.length);
                }
            } else {
                // we already have a connection no duplicates please
                console.log("duplicate connection");
                socket.end();
            }
        } else if (command === 'remove') {
            socket.end();
        } else if (command === 'giveSwarm'){
            this._mergeSwarms(lineData);
            // socket.write(JSON.stringify(message));
        } else if (command === 'getSwarm'){
            console.log('giving peer the swarm');
            var message = {
                command: "giveSwarm",
                data: this.swarm
            };
            console.log(message);
            message = JSON.stringify(message);
            socket.write(message);
        } else if (command === 'game') {
            // INTERACT with game here
            // this is an incoming game broadcast
            // to send a message to the other gamers use the broadcast function below
            console.log("got message: " + lineData);
            this.emit('message', lineData, socket);

        } else {
            // not a recognized option
            console.log("command " + command + " not recognized.");
            // socket.write("Did you say '"+line+"'?");
        }
    }

    _mergeSwarms(swarm) {
        var newSwarm = cleanSelf(arrayUnique(this.swarm.concat(swarm)), this);

        console.log(newSwarm);
        this._swarm = newSwarm;
    }

    _checkConnections() {

    }

    broadcast(msg) {
        this._distributeMessage('game', msg);
    }

    close() {
        console.log("disconnecting");
        this._distributeMessage('remove', '');
    }

    _distributeMessage(command, msg) {
        var message = {
            command: command,
            data: msg
        }
        message = JSON.stringify(message);
        for (var i = 0; i < this._connections.length; i++) {
            var socket = this._connections[i].socket;
            socket.write(message);
        }
    }


    directMessage(socket, msg) {
        var message = {
            command: 'game',
            data: msg
        }
        socket.write(JSON.stringify(message));
    }

    // sets the event listeners on the socket
    _initSocket(socket) {
        var self = this;
        socket.on('data', function(data) {
            self._process(data, socket);
        });
        socket.on('close', function(){
            console.log('a peer has closed the connection');
            console.log("number of current connections: " + self._connections.length);

            var peer = self._findPeerBySocket(this);
            if(peer !== false) {
                // maybe dont remove from swarm so on next swarm refresh we can attempt to reconnect to peer
                // self._removeFromSwarm(peer);
                self._removeConnection(peer);
                socket.end();
                console.log("peer " + peer.username + " removed successfully");
                console.log("number of current connections: " + self._connections.length);

            } else {
                console.log('could not find peer by socket');
                console.log(self._connections);
            }
            // process.exit(0);
        });
    }

    get swarm() {
        return this._swarm;
    }

    set swarm(swarm) {
        this._swarm = swarm;
    }

    get server() {
        return this._server;
    }

    get addr() {
        return this._addr;
    }

    set addr(addr) {
        this._addr = addr;
    }

    // finds a peer by their socket
    _findPeerBySocket(socket) {
        for (var i = 0; i < this._connections.length; i++) {
            if (this._connections[i].socket === socket) {
                return this._connections[i];
            }
        }
        return false;
    }

    // adds a peer to your swarm
    _addToSwarm(peer) {
        var copy = clone(peer, true, 1);
        delete copy.socket;
        if(this.swarm.indexOf(copy) === -1) {
            this.swarm.push(copy);
            this.swarm = arrayUnique(this.swarm);
            return true;
        } else {
            console.log("peer is already in swarm");
            return false;
        }
    }

    // remove a peer from your swarm. This is done during swarm update
    _removeFromSwarm(peer) {
        var index = this.swarm.indexOf(peer);
        if(index !== -1) {
            this.swarm.splice(index, 1);
            return true;
        } else {
            console.log("peer was not in swarm");
            return false;
        }
    }

    // adds a peer to your connections list
    _addConnection(connection) {
        if(this._connections.indexOf(connection) === -1) {
            this._connections.push(connection);
            return true;
        } else {
            console.log("peer is already connected to you close the connection");
            return false;
        }
    }

    // removes a peer from your connections list
    _removeConnection(connection) {
        var index = this._connections.indexOf(connection);
        if(index !== -1) {
            this._connections.splice(index, 1);
            return true;
        } else {
            console.log("peer was not in our connections");
            return false;
        }
    }
}

module.exports.Peer = Peer;

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            var iConString = a[i].host + ":" + a[i].port;
            var jConString = a[j].host + ":" + a[j].port;
            if(iConString === jConString)
                a.splice(j--, 1);
        }
    }

    return a;
}

function cleanSelf(array, peer) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        var iConString = a[i].host + ":" + a[i].port;
        var myConString = peer.connectionString;
        if(iConString === myConString)
            a.splice(i--, 1);
    }
    return a
}

function cleanSwarm(array) {
        var tmp = array.concat();
        for (var i = 0; i <  array.length; i++) {
            tmp.push({
                username: array[i].username,
                host: array[i].host,
                port: array[i].port
            });
        }
        return tmp;
}

function cloneObject(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
            temp[key] = cloneObject(obj[key]);
    }

    return temp;
}

var bob = {
    name: "Bob",
    age: 32
};