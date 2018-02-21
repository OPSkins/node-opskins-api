var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getHomepageBanners = function(callback) {
	this.get("IFeed", "GetHomepageBanners", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.banners);
	});
};

OPSkinsAPI.prototype.getFeaturedSales = function(callback) {
	this.get("IFeed", "GetFeatured", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.featured);
	});
};
