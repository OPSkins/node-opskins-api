var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getSales = function(req, callback) {
	if (typeof req === 'function') {
		callback = req;
		req = {};
	}

	this._requireKey();
	this.get("ISales", "GetSales", 1, req, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, meta.total_pages, res);
		}
	});
};

OPSkinsAPI.prototype.editPrice = function(saleID, price, callback) {
	this._requireKey();
	this.post("ISales", "EditPrice", 1, {"saleid": saleID, "price": price}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, !!res.relisted);
		}
	});
};
