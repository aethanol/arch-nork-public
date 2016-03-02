'use strict';
const world = require('../common/world.json');
    

class Game {
    
    constructor() {
        
        this._currRoom = world.rooms[0]; // initialize current room
        this._inventory = [];
       
    }
    
    play() {
        
        return 'Welcome to nork! \n' + world.rooms[0].description + '\n';
    }
    
    // method to parse user input and invoke proper function
    input(input) {
        // parse text to lowercase and split text by spaces to string array
        var text = input.toLowerCase().split(' ');
        
        switch(text[0]){
        case 'go' :
            return this.go(text[1]);
        case 'use' :
            return this.use(text[1]);
        case 'take' :
            return this.take(text[1]);
        case 'drop' :
            return this.drop(text[1]);
        case 'inventory' :
            return this.inventory();
        case 'brief' :
            return this.brief();
        default :   
            return 'That command was not understood'; 
        }
    }
    
    go(direction) {
        if (this._currRoom.exits[direction] !== undefined) {
            this._currRoom = this.findRoom(this._currRoom.exits[direction].id);
            return this._currRoom.description;
         // if the direction is not valid print error
        } else {
            return "you can't go that way";
        } 
        
    }
    
    // helper function to loop through rooms and find the right room
    findRoom(id) {
        for(var i = 0; i < world.rooms.length; i++){
           
            if(world.rooms[i].id === id){
                return world.rooms[i];
            }
        }
    }
    
    take(item) {
        var roomIndex = this._currRoom.items.indexOf(item);
        var invIndex = this._inventory.indexOf(item);
        // if index == -1 then that room does not contain item
        // also check that you don't already have item
        if(roomIndex !== -1 && invIndex === -1){
            this._inventory.push(item);
            return "It is a " + item + "! You add it to your inventory";
        } else {
            return "you can't take that!";
        }
        // if(this._currRoom['items'].includes(item)){
        //     //this._inventory.push(item);
        //     
        // } else {
        //     
        // }
        
    }
    
    use(item) {
        
    }
    
    inventory(){
        var inv = '';
        for(var i = 0; i < this._inventory.length; i++){
            inv +=(' ' + this._inventory[i]);
        }
        return 'You have:' + inv;
    }
       
}

module.exports = new Game();