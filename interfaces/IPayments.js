var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.createBitcoinPayment = function(amount, overwrite_old, callback) {
	this._requireKey();
	if (typeof overwrite_old === 'function') {
		callback = overwrite_old;
		overwrite_old = false;
	}
	this.post("IPayments", "CreateBitcoinPayment", 1, {
		"amount": amount,
		"overwrite_old": overwrite_old,
	}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res);
	});
};

OPSkinsAPI.prototype.getBitcoinAddress = function(callback) {
	this._requireKey();
	this.get("IPayments", "GetBitcoinAddress", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res);
	});
};

OPSkinsAPI.prototype.getBitcoinPaymentStatus = function(callback) {
	this._requireKey();
	this.get("IPayments", "GetBitcoinPaymentStatus", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res);
	});
};

OPSkinsAPI.prototype.getEthereumAddress = function(callback) {
	this._requireKey();
	this.get("IPayments", "GetEthereumAddress", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, res);
	});
};
