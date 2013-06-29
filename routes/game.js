exports.play = function(req, res) {
	res.setHeader("Expires", "-1");
	res.setHeader("Cache-Control", "must-revalidate, private");
	res.render('game/client', { title: "Langenium Game Client Alpha", editor: false });
};
exports.editor = function(req, res) {
	res.setHeader("Expires", "-1");
	res.setHeader("Cache-Control", "must-revalidate, private");
	res.render('game/editor', { title: "Langenium Map Editor Alpha", editor: true });
};
