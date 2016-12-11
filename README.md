# Langenium 2016 Rebuild 

The entire Langenium project is getting a kick in the proverbial this year.

## Why is this happening?

From the beginning, the technical architecture for Langenium has depended on new techniques and API's for core funtionality; some of which aren't considered "production ready". Game engines in particular are often purpose built around the processing requirements. In my experience building a web game, the challenge seems to shift away from processing power and onto content distribution/generation; the bottleneck for the web is the internet itself, rather than the users's machine.

We still aren't at a point where a 40GB game can be reliably streamed into someone's FOV, but procedural generation and smart use of effects can sidestep this issue considerably. I'd say this is the main reason I've refactored so many times now - because the time spent maintaining the code and asset pipeline outstrips my ability to progress creatively and overall on the project.

This rebuild aims to streamline my own toolset so that it's easy to extend and maintain over the years. I've also developed in my own knowledge over the years so a lot of that has come into this.

So without further a rant, here's what I'm thinking!

Ideas to implement:
- ReactJS (https://facebook.github.io/react/)
  - Has virtual DOM, could be very valuable for non blocking game logic
  - Has virtual DOM, could be a IO nightmare... need to benchmark @ 60FPS
- Bring back my Nodes!
  - Node.js application was previously scrapped as multiplayer was put on hold
- Server application to be restored as "file bitch"
  - Generate files for the client such as CSS/HTML/JS
  - Build up assets built on files from universe directory (need to think about design<->dev process)
- Physics is the language of our soul
  - Simple environmental effects provided by physics give life to scenes
  - Huge gameplay options are opened up
  - Need to implement physics, either by going full Whitestorm or integrating another lib
- Event and object management
  - The original idea to hang everything off a global L object was good, but it lacked decent state management/event handling
  - Rather than being triggered to do stuff directly and locking up IO, the event/object system should be able to watch a queue of commands and adjust itself and push updates out to other queues to update other things.
- Dev Server
  - Rather than running http-server, a "file bitch" type server should provide HTTP, asset generation and socket.io connectivity (util).
- Project planning
  - Over the years I've stopped and started a lot of trial phases and I need better documentation for me to go back on to check my own findings/examples of work
  - JIRA/Gantt type stuff is too far, but some rudimentary task planning/milestoning is a good idea. Particularly as part of evaluating new tech for the points above
  - Submodules for external repositories. Move the 'universe' repo into a subfolder so that images etc can be references directly. Might be able to get away with scrapping resource folder structure since universe can be linked directly on the same domain.


Ideas to scrap:
- Flat file HTML only (maintenance nightmare)
- JS based dependency injection (maintenance nightmare, probably insecure AF)
- Engine "modes". This was a cool idea but doesn't translate well to device browsers, often causes the website client to freeze initially just to "boot up". Kind of sad :/
- Inline shader scripts. This heavily polluted the HTML files, need to to include them externally.
- Scenograph. Sadly this has not worked out. Need to look at either a React based scene builder or something that will hook into the "event system"
- Console logging system. Need nicer solution, probably find a library for it.
