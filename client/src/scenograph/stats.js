var stats = function() {

	this.latency = new TimeSeries();
	
	this.time = {
		now: Date.now(),
		delta: 0,
		last: 0
	};

	this.fps = {
		frames: 0,
		now: new TimeSeries(),
		min: Infinity,
		max: 0,
		last: Date.now()
	};
	
	this.update = function() {
		// These bindings will later be abstracted to new classes
		// Something like a view template for all the Scenograph->Ember bindings
		L.scenograph.stats.time.last = this.time.now;
		L.scenograph.stats.time.now = Date.now();
		L.scenograph.stats.time.delta = parseFloat(this.time.now - this.time.last);
		
		this.fps.frames++;
		if ( this.time.now > this.fps.last + 1000 ) {
			L.scenograph.stats.fps.now.append(this.time.now, Math.round( ( this.fps.frames * 1000 ) / ( this.time.now - this.fps.last ) ));
			L.scenograph.stats.fps.last = this.time.now;
			this.fps.frames = 0;
		}

	};
};

stats.prototype._init = function() {
	L.scenograph.stats = new stats();
}