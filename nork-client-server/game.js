'use strict';
const world = require('../common/world.json');
    

class Game {
    
    constructor(){
        this._currRoom = world.rooms[0]; // initialize current room
        this._inventory = [];
        this._status = undefined;
    }
    
    play() {
        
        return 'Welcome to nork! \n' + world.rooms[0].description + '\n';
    }
    
    // method to parse user input and invoke proper function
    input(input) {
        
        // parse text to lowercase and split text by spaces to string array
        var text = input.toLowerCase().split(' ');
        var cond = '';
        
        switch(text[0]){
        case 'go' :
            cond = this.go(text[1]);
            break;
        case 'use' :
            cond = this.use(text[1]);
            break;
        case 'take' :
            cond = this.take(text[1]);
            break;
        case 'drop' :
            cond = this.drop(text[1]);
            break;
        case 'inventory' :
            cond = this.inventory();
            break;
        case 'brief' :
            cond = this.brief();
            break;
        default :   
            cond = 'That command was not understood'; 
        }
        // then check if that move was a win condition
        if(this.status !== undefined){
            cond += '\nyou ' + this.status + '!';
        }
       
        
        return cond;
    }
    
    go(direction) {
        if (this._currRoom.exits[direction] !== undefined) {
            // go to that room
            this.goto(this._currRoom.exits[direction].id);
            return this.brief();
         // if the direction is not valid print error
        } else {
            return "you can't go that way!";
        } 
        
    }

    // helper function to loop through rooms and goto the right room
    goto(id) {
        for(var i = 0; i < world.rooms.length; i++){
            //if the current room matches passed id, change rooms
            if(world.rooms[i].id === id){
                this._currRoom = world.rooms[i];
                // then check if that was a win or lose
                this.winLose();
            }
        }
    }
    
    get status(){
        return this._status;
    }
    
    // check if the current room has a status, and set the current status
    winLose() {
        if(this._currRoom.hasOwnProperty('status')){
            this._status = this._currRoom.status;
        }
    }
    
    take(item) {
        try{
            // use index of to return the index of the item in inventory and the room
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
    
    // return current room description
    brief(){
        return this._currRoom.description;
    }
    
    // return the list of items you posess
    inventory(){
        var inv = '';
        for(var i = 0; i < this._inventory.length; i++){
            inv +=(' ' + this._inventory[i]);
        }
        return 'You have:' + inv;
    }
    
       
}

module.exports = new Game();