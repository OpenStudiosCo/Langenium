module.exports = function (ember_app) {
	ember_app.GamesRoute = Ember.Route.extend({
		model: function() {
			return this.store.findAll('prototype');
		}		
	});

	ember_app.EpochExordiumRoute = Ember.Route.extend({
		renderTemplate: function() {
			console.log("Starting up Epoch Exordium engine")
		}
	});

	ember_app.MmoRoute = Ember.Route.extend({
		renderTemplate: function() {
			console.log("Starting up MMO engine")
		}
	});

	ember_app.PrototypesRoute = Ember.Route.extend({
		model: function(params) {
			return this.store.find('prototype', params.id)
		},
		renderTemplate: function() {
			console.log("Starting up '" + this.currentModel._data.title + "' prototype")
		}
	});

	ember_app.Prototype = DS.Model.extend({
		title: DS.attr('string'),
		description: DS.attr('string')
	});
	
	ember_app.Prototype.FIXTURES = [
		{
			id: 0,
			title: "Epoch Exordium Level 1",
			description: "First attempt at creating a self contained level"
		},
		{
			id: 1,
			title: "MMO Preview 1",
			description: "Rebuilding the MMO ship preview in the Phase 4 engine"
		}
	];
}