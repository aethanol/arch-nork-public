'use strict';
const world = require('../common/world.json');
    

class Game {
    
    constructor() {
        
        this._currRoom = world.rooms[0]; // initialize current room
        this._inventory = [];
       
    }
    
    play() {
        
    }
    
    input() {
        
    }
    
    go(direction) {
        if (this._currRoom.exits[direction] != undefined) {
            this._currRoom = world.rooms[this._currRoom.exits[direction]];
            return true;
         // if the direction is not valid print error
        } else {
            return "you can't go that way";
        }
    }
    
    take(item) {
        if(this._currRoom[item]){
            this._inventory.push(item);
            return "It is a " + item + "! You add it to your inventory";
        } else {
            return "you can't take that!";
        }
    }
    
    use(item) {
        
    }
       
}

module.exports = new Game();