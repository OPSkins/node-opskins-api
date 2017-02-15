var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getBotList = function(callback) {
	this._requireKey();
	this.get("IStatus", "GetBotList", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

