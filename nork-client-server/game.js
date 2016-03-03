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
            // go to that room
            this.goto(this._currRoom.exits[direction].id);
            return this.brief();
         // if the direction is not valid print error
        } else {
            return "you can't go thast way";
        } 
        
    }

    // helper function to loop through rooms and goto the right room
    goto(id) {
        for(var i = 0; i < world.rooms.length; i++){
           
            if(world.rooms[i].id === id){
                this._currRoom = world.rooms[i];
            }
        }
    }
    
    
    
    take(item) {
        try{
            var roomIndex = this._currRoom.items.indexOf(item);
            var invIndex = this._inventory.indexOf(item);
        }
        catch(e){
            return "you can't take that!";
        }
        
        // if index == -1 then that room does not contain item
        // also check that you don't already have item
        if(roomIndex !== -1 && invIndex === -1){
            this._inventory.push(item);
            return "It is a " + item + "! You add it to your inventory";
        } else {
            return "you can't take that!";
        }
        
    }
    
    use(item) {
        // get index of item, -1 if not
        var invIndex = this._inventory.indexOf(item);
        
        // first check if we have that item
        if(invIndex !== -1){
            // then check if the room you're in matches the uses
            try{
                var use = this.useCase(item);
                var desc = use.description;
                this.goto(use.effect.goto);
                desc += '\n' + this.brief();
                return desc;
            }
            catch(e){
                return "you can't use that here!";
            }
                   
        } else {
            return "you don't have that!";
        }
    }
    
    // find if used item has use in current room
    // as the current world.json file is set up we don't need this
    // but in the future with multiple use cases, this will be helpful
    useCase(item){
        // loop through rooms uses
        for(var i = 0; i < this._currRoom.uses.length; i++){
            if(this._currRoom.uses[i].item === item){
                return this._currRoom.uses[i];
            }
            
        }
    }
    
    brief(){
        return this._currRoom.description;
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