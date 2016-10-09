var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getPriceList = function(appid, callback) {
	this.get("IPricing", "GetPriceList", 1, {"appid": appid}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res, meta.time);
		}
	});
};

OPSkinsAPI.prototype.getLowestPrices = function(appid, callback) {
	this.get("IPricing", "GetAllLowestListPrices", 1, {"appid": appid}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res, meta.time);
		}
	});
};
