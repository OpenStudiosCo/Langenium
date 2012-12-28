Langenium
=========

Langenium is a web based sci-fi MMORPG, in a simple retro 3D setting (think N64/PS1).

The game is set on the (mostly water-) planet Ibidan. Players embark on a career as either a Mercenary, Sniper, Pirate, Assassin, Techomancer or Biomancer.

Here’s a very basic demo (be warned, it is currently very inefficient when loading).

Requirements: Google Chrome, modernish PC

The game architecture can be boiled down to three components:
* (Game Server) PaaS for a node.js and mongoDB resources. 
* (Client Host) Apache/Linux hosting to serve client files including scripts, game assets, etc.
* (Game Client) In-browser a webGL engine utilizing jQuery and three.js, among others

The Server connects to the Client via websockets to create a live connection.

I haven’t fully decided how to setup the Apache server, but I would like to use either a custom application or maybe MODx to drive both the Langenium website and manage meshes/textures, etc.

The Client receives instructions from the Game Server, telling it what to cache from the Client Host and what to push to the user.