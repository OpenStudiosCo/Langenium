/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


	API
	This is the router that exposes client accessible parts of the engine


\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/


/*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	Setup Globals
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*/

exports.bind = function(app, db, fb, instances, io, passport) {
	/*

	api (socket) paths:

	------------
	
	feeds:
		Subscribable 'rooms' which receive broadcasted updates

		When cloaking is later implemented, a player will exist in the scene in spectator mode. Due to caching, the ship might pre-load and make them aware its nearby, 
		but they'll have no idea where it is until it's popped into existence (if that even happens)

	------

	feeds:server_stats
	
		in->
			feeds:server_stats:subscribe
				(no parameters)
		<-out
			feeds:server_stats:update
				cpu: { 
					times: {
						integers -> user, irq, nice, idle, sys 
					}
				}
				memory: {
					usage: {
						integers -> rss, heapTotal, heapUsed
					}
					integers -> free, total
				}
				visitors: { admin, game, website }





	------

	feeds:instance

		in:
			feeds:instance:subscribe
			feeds:instance:input

		out:
			feeds:instance:update:character
				_id <- from character collection
			feeds:instance:update:scene_objects
				_id <- from scene_objects collection
			feeds:instance:update:ship
				_id <- from ship collection
	
	------------

	user

	------------

	data

	data:characters
	data:intance_objects
	data:instances
	data:characters
	data:characters
	data:characters
	*/
}