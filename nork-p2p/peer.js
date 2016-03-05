'use strict';
const net = require('net'); //import socket module
const readline = require('readline');
const events = require('events');
var clone = require('clone');

class Peer {
    constructor(name, port, game){
        this._name = name;
        this._port = port;
        this.game = game;
        this._host = '127.0.0.1'
        this.connectionString = this._host + ":" + this._port;
        this._server = net.createServer(); //create socket server
        this._swarm = {};
        this._connections = {};
        this._history = {};
        Peer.prototype.__proto__ = events.EventEmitter.prototype;
        events.EventEmitter.call(this);
        this._swarmUpdater = setInterval(this._update, 120000, true, this);
        // this._emitter = new events.EventEmitter();
        // this._request = serverBehavior;
        // this._process = clientBehavior;
    }

    start() {
        var self = this;
        this.server.listen(this._port, function(){
             self.addr = self.server.address();
            // console.log('server listening on port %d', self.addr.port);
        });

        this.server.on('connection', function(socket) {
            // console.log("a peer has connected.");
            // socket.write('connected: ' + socket.remoteAddress +':'+ socket.remotePort +'\n');
            self._initSocket(socket, false);
        });
    }

    // sets the event listeners on the socket
    _initSocket(socket, reconnecting) {
        var self = this;
        socket.on('data', function(data) {
            self._process(data, socket);
        });
        socket.on('close', function(){
            // console.log('a peer has closed the connection');
            // console.log("number of current connections: " + Object.keys(self._connections).length);

            self._findPeerBySocket(this).then(function(peer){
                if(peer !== false) {
                    // maybe dont remove from swarm so on next swarm refresh we can attempt to reconnect to peer
                    if(reconnecting) {
                        self._removeFromSwarm(peer);
                    }
                    self._removeConnection(peer);
                    // console.log("peer " + peer.username + " removed successfully");
                    // console.log("number of current connections: " + Object.keys(self._connections).length);
                    socket.end();
                } else {
                    // console.log('could not find peer by socket');
                    // console.log(self._connections);
                }
            });

            // process.exit(0);
        });
        socket.on('error', function(error){
            // console.log(error);
            // console.log(this);
            var peer = {
                connectionString: error.address + ":" + error.port,
                port: error.port,
                host: error.address
            };
            if(reconnecting) {
                self._removeFromSwarm(peer);
                self._removeConnection(peer);
                socket.end();
            }

            // self._findPeerBySocket(this).then(function(peer){
            //     if(peer !== false) {
            //         // maybe dont remove from swarm so on next swarm refresh we can attempt to reconnect to peer
            //         if(reconnecting) {
            //             self._removeFromSwarm(peer);
            //         }
            //         self._removeConnection(peer);
            //         // console.log("peer " + peer.username + " removed successfully");
            //         // console.log("number of current connections: " + Object.keys(self._connections).length);
            //         socket.end();
            //     } else {
            //         console.log('could not find peer by socket');
            //         // console.log(self._connections);
            //     }
            // });
        });
    }

    //connect to a peer
    connect(peer, reconnecting) {
        if (reconnecting === undefined) {
            reconnecting = false;
        }
        var socket = new net.Socket();
        var self = this;
        socket.connect(peer.port, peer.host, function() {
            // console.log('Connected to: ' + peer.host + ':' + peer.port);
            self._addToSwarm(peer)
            peer.socket = socket;
            self._addConnection(peer);
            self._addToHistory(peer);

            var credentials = {
                username: self._name,
                host: self._host,
                port: self._port,
                connectionString: self._host + ":" + self._port
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
        this._initSocket(socket, reconnecting);
    }

    // proccess data from a socket
    _process(data, socket) {
        var line = data.toString().trim();
        line = JSON.parse(line);
        var command = line.command;
        var lineData = line.data;

        if(command === 'exit'){
            // console.log('disconnected');
            socket.end();
        }else if (command === 'add') {
            var peer = lineData;
            if(!(peer.connectionString in this._connections)) {
                if(this._addToSwarm(peer)) {
                    peer.socket = socket;
                    this._addToHistory(peer);
                    if(this._addConnection(peer)) {
                        // console.log("peer " + peer.username + " added successfully");
                        // console.log("swarm length: " + Object.keys(this._swarm).length);
                    }
                }
            } else {
                // we already have a connection no duplicates please
                // console.log("duplicate connection");
                socket.end();
            }
        } else if (command === 'remove') {
            socket.end();
        } else if (command === 'giveSwarm'){
            this._mergeSwarms(lineData);
            this._connectToSwarm(false);
            // socket.write(JSON.stringify(message));
        } else if (command === 'getSwarm'){
            // console.log('giving peer the swarm');
            var message = {
                command: "giveSwarm",
                data: this.swarm
            };
            // console.log(message);
            message = JSON.stringify(message, function(key, value){
                if(key == 'socket') {
                    return undefined;
                } else {
                    return value;
                }
            });
            socket.write(message);
        } else if (command === 'game') {
            // INTERACT with game here
            // this is an incoming game broadcast
            // to send a message to the other gamers use the broadcast function below
            // console.log("got message: " + lineData);
            this.emit('message', lineData, socket);

        } else {
            // not a recognized option
            console.log("command " + command + " not recognized.");
            // socket.write("Did you say '"+line+"'?");
        }
    }

    _update(reconnecting, self) {
        // console.log('updating');
        self._connectToSwarm(reconnecting);
    }


    _mergeSwarms(swarm) {
        var newSwarm = extend(this._swarm, swarm);
        delete newSwarm[this.connectionString];
        // console.log(newSwarm);
        this._swarm = newSwarm;
    }

    _connectToSwarm(reconnecting) {
        // console.log("checking " + Object.keys(this._swarm).length + " peers in swarm");
        // console.log(this._swarm);
        Object.keys(this._swarm).forEach(function(key) {
            var swarmString = this._swarm[key].connectionString;
            // console.log(swarmString);
            if(!(swarmString in this._connections)) {

                this.connect(this._swarm[key], reconnecting);
            } else {
                // console.log('not connecting');
            }
        }, this);
    }

    //distirbute a game message to all peers
    broadcast(msg) {
        this._distributeMessage('game', msg);
    }

    // tell all peer to remove you from their connections, then remove the updater and close out our server and connections
    close() {
        console.log("disconnecting");
        this._distributeMessage('remove', '');
        clearInterval(this._swarmUpdater);
        this._server.close();
        Object.keys(this._connections).forEach(function(key) {
            this._connections[key].socket.end();
        }, this);
    }

    // send any command to all peers
    _distributeMessage(command, msg) {
        var message = {
            command: command,
            data: msg
        }
        message = JSON.stringify(message);
        Object.keys(this._connections).forEach(function(key) {
            var socket = this._connections[key].socket;
            socket.write(message);
        }, this);
    }

    // send a game message to any socket
    directMessage(socket, msg) {
        var message = {
            command: 'game',
            data: msg
        }
        socket.write(JSON.stringify(message));
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
        var self = this;
        var promise = new Promise(function(resolve, reject) {
            Object.keys(self._history).forEach(function(key, index) {
                if (self._history[key].socket === socket) {
                    resolve(self._history[key]);
                } else {
                    if(index === Object.keys(self._history).length -1) {
                        resolve(false);
                    }
                }
            }, this);
        });

        return promise;
    }

    // adds a peer to your swarm
    _addToSwarm(peer) {
        if(!(peer.connectionString in this.swarm)) {
            this.swarm[peer.connectionString] = peer;
            return true;
        } else {
            if(this.swarm[peer.connectionString].socket !== peer.socket) {
                this.swarm[peer.connectionString].socket = peer.socket;
                return true;
            } else {
                return false;
            }
            // console.log("peer is already in swarm");
        }
    }

    // remove a peer from your swarm. This is done during swarm update
    _removeFromSwarm(peer) {
        if(peer.connectionString in this.swarm) {
            delete this.swarm[peer.connectionString];
            return true;
        } else {
            // console.log("peer was not in swarm");
            return false;
        }
    }

    // adds a peer to your connections list
    _addConnection(connection) {
        if(!(connection.connectionString in this._connections)) {
            this._connections[connection.connectionString ] = connection;
            return true;
        } else {
            // redunadncy in case the off case the client doesnt realize that it already holds a connect
            // console.log("peer is already connected to you, close the connection");
            return false;
        }
    }

    // removes a peer from your connections list
    _removeConnection(connection) {
        if(connection.connectionString in this._connections) {
            delete this._connections[connection.connectionString];
            return true;
        } else {
            // redunadncy in case the off case the client doesnt realize that it already holds a connect
            // console.log("peer was not in our connections");
            return false;
        }
    }

    // adds a peer to the historical list
    _addToHistory(peer) {
        var copy = clone(peer);
        if(!(peer.connectionString in this._history)) {
            this._history[peer.connectionString] = peer;
            return true;
        } else {
            // console.log("peer is already in history");
            return false;
        }
    }
}

module.exports.Peer = Peer;

function extend(obj, src) {
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
}