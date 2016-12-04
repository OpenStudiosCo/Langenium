# Langenium 2016 Rebuild 

## Why is this happening?

From the beginning, the technical architecture for Langenium has depended on new techniques and API's for core funtionality; some of which aren't considered "production ready". Game engines in particular are often purpose built around the processing requirements. In my experience building a web game, the challenge seems to shift away from processing power and onto content distribution/generation; the bottleneck for the web is the internet itself, rather than the users's machine.

We still aren't at a point where a 40GB game can be reliably streamed into someone's FOV, but procedural generation and smart use of effects can sidestep this issue considerably. I'd say this is the main reason I've refactored so many times now - because the time spent maintaining the code and asset pipeline outstrips my ability to progress creatively and overall on the project.

So without further a rant, here's what I'm thinking!

Ideas to implement:
- ReactJS (https://facebook.github.io/react/)
-- Has virtual DOM, could be very valuable for non blocking game logic
-- Has virtual DOM, could be a IO nightmare... need to benchmark @ 60FPS
- Bring back my Nodes!
-- Node.js application was previously scrapped as multiplayer was put on hold
-- Server application to be restored as "file bitch", to generate files for the client such as CSS/HTML/JS
- Physics is the language of our soul

Ideas to scrap:
- Flat file HTML only (maintenance nightmare)
- JS based 