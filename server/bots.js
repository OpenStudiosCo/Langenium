

function updateBotsFromBuffer(bullets, delta, update_queue, bots, events, players_online, THREE, world_map, shootCheck) {
	bots.forEach(function(bot, index){
		if (players_online.length > 0) {

			var 	fire = 0,
					radian = 0.01744444444444444444444444444444,
					rY = 0;	
			
			if (bot.rotation.y  > getTheta(bot, players_online[0])) {
				if (bot.rotation.y - radian < getTheta(bot, players_online[0])) { }
				else { bot.rotation.y -= radian;	rY -= radian; }
			}
			else {
				if (bot.rotation.y + radian > getTheta(bot, players_online[0])) { }
				else { bot.rotation.y += radian;	rY+= radian; }
			}
			
			if (
					bot.movement_buffer &&
					(getDistance(bots[index], players_online[0]) - bots[index].movement_buffer.distance < 200)&&
					checkMovementBuffer(bot.movement_buffer) == true
				)
				{
				var 	tX = events.moveBot(bot.movement_buffer.xBuffer), 
						tY = events.moveBot(bot.movement_buffer.yBuffer), 	
						tZ = events.moveBot(bot.movement_buffer.zBuffer);
						
				if (tX.instruction != 0) { bot.position.x += tX.instruction; bot.movement_buffer.xBuffer = tX.buffer; }
				if (tY.instruction != 0) { bot.position.y += tY.instruction; bot.movement_buffer.yBuffer = tY.buffer; }
				if (tZ.instruction != 0) { bot.position.z += tZ.instruction; bot.movement_buffer.zBuffer = tZ.buffer; }

				if (
						(getDistance(bot, players_online[0]) < 1500) &&
						(bot.rotation.y - getTheta(bot, players_online[0]) < .0314)&&
						(
							(players_online[0].position.y - bot.position.y < 50)&&
							(players_online[0].position.y - bot.position.y > -50)
						) &&
						shootCheck == true
				) {
					fire = 1;
				}
				update_queue.push(
					{ instruction: { name: "move", type: "bot", details: { fire: fire, pX: tX.instruction, pY: tY.instruction * .7, pZ: tZ.instruction, rY: rY, id: bot.id } } }
				);
			}
			else {
				bot.movement_buffer = events.makeBotMovementBuffer(bot, players_online[0].position, getAngle(bot, players_online[0]), getDistance(bot, players_online[0]));
			}
		}
		else {
			if ((bot.movement_buffer)&&
				((bot.movement_buffer.xBuffer != 0)||
				(bot.movement_buffer.yBuffer != 0)||
				(bot.movement_buffer.zBuffer != 0))) {
					bot.movement_buffer.xBuffer = 0;
					bot.movement_buffer.yBuffer = 0;
					bot.movement_buffer.zBuffer = 0;
			}		
		}
	});
}