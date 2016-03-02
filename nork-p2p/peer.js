'use strict';
var net = require('net'); //import socket module
var readline = require('readline');

class Peer {
    constructor(name, port){
        this._name = name;
        this._port = port;
        this._server = net.createServer(); //create socket server
        this._swarm = [];
        this._connections = [];
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
            socket.write('connected: ' + socket.remoteAddress +':'+ socket.remotePort +'\n');
            socket.on('data', function(data) {
                self._process(data, socket);
            });
            socket.on('close', function(){
                console.log('a peer has closed the connection');

                var peer = self._findPeerBySocket(this);
                self._removeFromSwarm(peer);
                self._removeConnection(peer);
                // process.exit(0);
            });
        });
    }

    connect(peer) {
        //connect to a peer
        var socket = new net.Socket();
        var self = this;
        peer.socket = socket;
        socket.connect(peer.port, peer.host, function() {
            console.log('Connected to: ' + peer.host + ':' + peer.port);
            self._addToSwarm(peer);
            self._addConnection(peer);

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
        });

        const io = readline.createInterface(process.stdin, process.stdout);

        io.setPrompt('> ');
        io.prompt();

        io.on('line', function(line){
            self._process(line)
        }).on('close', function() {
            socket.destroy();
            self._removeFromSwarm(peer);
            self._removeConnection(peer);
            console.log('Have a great day!');
            process.exit(0);
        });
    }

    _process(data, socket) {
        var line = data.toString().trim();
        line = JSON.parse(line);
        var command = line.command;
        var lineData = line.data;

        if(command === 'exit'){
            socket.write('disconnected');
            socket.end();
        }else if (command === 'add') {
            var peer = lineData;
            if(this._addToSwarm(peer)) {
                peer.socket = socket;
                if(this._addConnection(peer)) {
                    console.log("peer " + peer.username + " added successfully");
                }
            } else {
                // we already have a connection no duplicates please
                socket.end();
            }
        } else if (command === 'remove') {
            var peer = lineData;
            // remove peer and connectee
            if(this._removeFromSwarm(peer)) {
                if(this._removeConnection(peer)) {
                    console.log("peer " + peer.username + " removed successfully");
                    socket.end();
                }
            }
        } else if (command === 'giveSwarm'){
            this._mergeSwarms(data);
            socket.write(JSON.stringify(message));
        } else if (command === 'getSwarm'){
            var message = {
                command: "giveSwarm",
                data: this.swarm
            };
            socket.write(JSON.stringify(message));
        } else if (command === 'game') {
            // INTERACT with game here
            // this is an incoming game broadcast
            // to send a message to the other gamers use the broadcast function below

        } else {
            // not a recognized option
            socket.write("Did you say '"+line+"'?");
        }
    }

    _mergeSwarms(swarm) {

    }

    _checkConnections() {

    }

    broadcast() {

    }

    get swarm() {
        return this._swarm;
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

    _findPeerBySocket(socket) {
        for (var i = 0; i < this._connections.length; i++) {
            if (this._connections[i].socket === socket) {
                return this._connections[i];
            }
        }
        return false;
    }

    _addToSwarm(peer) {
        if(this.swarm.indexOf(peer) === -1) {
            this.swarm.push(peer);
            return true;
        } else {
            console.log("peer is already in swarm");
            return false;
        }
    }

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

    _addConnection(connection) {
        if(this._connections.indexOf(connection) === -1) {
            this._connections.push(connection);
            return true;
        } else {
            console.log("peer is already connected to you close the connection");
            return false;
        }
    }
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