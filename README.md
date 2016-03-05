# Architected Nork

This repository contains two versions of a simple text-based game called Nork, developed as part of a [course](http://arch-joelross.rhcloud.com/) at the UW iSchool.

The below questions should be answered (in detail!) regarding your submission!

##### NOTICE
>  If you want to use the peer to peer game, you can run the demo file which creates the tracker and three peers in the same console. This can be a little confusing to watch because there are three copies of the game updating at the same time.
> You can also play by starting the tracker.js and then running copies of index.js (the game) in multiple terminal windows.


##### 1. Did you work with a partner? If so, who?
> Liam (William Menten-Weil) and Ethan (Ethan Anderson) were partners for arch-nork.



##### 2. Discuss how the different architectural styles affected the implementation of your program. Was one pattern easier to use or more effective _for this problem_? Why? How do the different styles influence the ability to add new features or modify existing functionality? What kind of changes would be easier or harder with each style?
##### This discussion should be a couple of paragraphs, giving a detailed analysis of how the styles work.
> In order to facilitate the implementation of the client-server architecture the game had to be separated into an interface, a game instance, and the network systems for the communication between server and  client. creating a separate entity to run the game makes it easier to control interactions between players and alter the same world state. For instance if players wanted to change the properties of the world.json file it would be easy because there is only one place where it exists, the server. Client-server would be incondusive to proliferating information across a network rapidly as there are more jumps between players beacuse each one can only talk to the server. Overall, nork fits well into a client-server architecture because, like most games, there is already a layer where the game interacts with the player. So, it is not much harder to have this interaction be across a network connection.

> The second architectural style we implemented was peer-to-peer. This style was more difficult that the client-server architecture because it took a lot of logic to manage the connections between peers efficently and without duplication. In our peer-to-peer implementation each peer is a game client with communicates with the network of players. This made the general design of the game easy because it was all hosted locally. Having a decentralized network makes it easy to pass messages between players quickly because each connection is direct. However, this architecture makes it difficult to syncronize modifications of the world state because latency is not 0 and connections are not guareteed to work.

> Since both types of game are network based adding new features to them is relativly easy. In most cases it just involves creating new message types/commands and building the function to process them.



##### 3. Did you add an extra features to either version of your game? If so, what?
> We implemented the nork game with a peer to peer architecture, in order to illustrate the action of having multiple peers connecting to eachother without a centralized server. We created a messaging system in which a peer can directly transmit to targeted peers, or a global messaging system that messages every peer in the swarm.



##### 4. Approximately how many hours did it take you to complete this assignment? #####
> We each spent approximately 6 hours



##### 5. Did you receive help from any other sources (classmates, etc)? If so, please list who (be specific!). #####
>  no



##### 6. Did you encounter any problems in this assignment we should warn students about in the future? How can we make the assignment better? #####
> Not particularly!


