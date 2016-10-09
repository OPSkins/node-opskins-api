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
