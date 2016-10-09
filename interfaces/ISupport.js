var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.repairItem = function(saleID, callback) {
	this._requireKey();
	this.post("ISupport", "RepairItem", 1, {"saleid": saleID}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, !!res.repaired, res.type, res.bot, res.repairedSaleids);
		}
	});
};
