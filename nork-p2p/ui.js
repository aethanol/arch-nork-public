'use strict';
const readline = require('readline'),
    io = readline.createInterface(process.stdin, process.stdout);
class GameInterface {
    constructor(game) {
        this._game = game;
        this._chatlog = [];
    }

    start() {
            // prompt the user
        var game = this._game;
        var chatlog = this._chatlog;
        var self = this;
        console.log(game.start());
        io.setPrompt('> ');
        io.prompt();

        io.on('line', function(line){
            switch(line.trim()) {
            case 'exit':
                io.close();
                break;
            default:
                console.log("");
                self._printChatbox(6);
                console.log(game.input(line));
                break;
            }
            // then prompt again
            io.prompt();
        }).on('close', function() {
            //end the connection to the server if the user manually closes
            game.close();
            console.log('client disconnected');
            process.exit(0);
        });
    }



    message(msg) {
        this._chatlog.push(msg);
        return true;
    }

    _printChatbox(num) {
        for(var i = this._chatlog.length - (num - 1); i < this._chatlog.length; i++) {
            if (i>=0) {
                console.log(this._chatlog[i].username + ": " + this._chatlog[i].message);
            }

        }
    }


}

module.exports.GameInterface = GameInterface;