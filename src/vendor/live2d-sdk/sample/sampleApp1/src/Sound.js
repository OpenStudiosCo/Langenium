function Sound(path) {
    this.snd = document.createElement("audio");
    this.snd.src = path;
    
}

Sound.prototype.play = function() {
    this.snd.play();
};

Sound.prototype.stop = function() {
    this.snd.stop();
};
