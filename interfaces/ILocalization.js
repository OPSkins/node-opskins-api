var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getCountriesRegions = function(callback) {
	this.get("ILocalization", "GetCountriesRegions", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res.countries);
	});
};

OPSkinsAPI.prototype.getSupportedLanguages = function(callback) {
	this.get("ILocalization", "GetSiteLanguages", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res.lang);
	});
};
