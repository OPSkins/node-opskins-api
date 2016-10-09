var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getSteamID = function(callback) {
	this._requireKey();
	this.get("ITest", "TestAuthed", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res.id64, meta.time);
		}
	})
};
