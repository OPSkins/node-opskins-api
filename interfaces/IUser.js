var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getBalance = function(callback) {
	this._requireKey();
	this.get("IUser", "GetBalance", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, meta.balance);
		}
	});
};

OPSkinsAPI.prototype.updateTradeURL = function(url, callback) {
	this._requireKey();
	this.post("IUser", "SaveTradeURL", 1, function(err, res, meta) {
		callback(err || null);
	});
};
