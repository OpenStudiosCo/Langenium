Langenium
=========

Langenium is a web based sci-fi MMORPG, in a simple retro 3D setting (think N64/PS1).

The game is set on the (mostly water-) planet Ibidan. Players embark on a career as either a Mercenary, Sniper, Pirate, Assassin, Techomancer or Biomancer.

Requirements: webGL capable browser (Google Chrome, Firefox), modernish PC

The game architecture can be boiled down to three components:
* (Game Server) Node.JS application listening on both a HTTP connection and socket
* (Game Client) In-browser a webGL engine utilizing jQuery and three.js, among others
* (Website) Built-in modules to deliver static files and pages for the game website and client

/play launches the game client 

/editor launches the map editor

The game has been designed to be a single package for now as I anticipate a heavy use of dynamic micro-templates.
