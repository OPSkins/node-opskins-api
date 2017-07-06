var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.getCashoutAddress = function(processor, callback) {
	this._requireKey();
	this.get("ICashout", "GetAddress", 1, {"processor": processor}, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		callback(null, res.address, res.processor_name, new Date(res.timestamp * 1000), res.can_change, res.change_requires_twofactor);
	});
};

OPSkinsAPI.prototype.setCashoutAddress = function(processor, address, twoFactorCode, callback) {
	if (typeof twoFactorCode === 'function') {
		callback = twoFactorCode;
		twoFactorCode = null;
	}

	this._requireKey();
	this.post("ICashout", "SetAddress", 1, {"processor": processor, "address": address, "twofactor_code": twoFactorCode}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res.address, res.processor_name);
	});
};

OPSkinsAPI.prototype.getPendingCashouts = function(callback) {
	this._requireKey();
	this.get("ICashout", "GetPendingCashouts", 1, function(err, res) {
		if (err) {
			callback(err);
			return;
		}

		res.cashouts.forEach(function(cashout) {
			cashout.timestamp = new Date(cashout.timestamp * 1000);
		});

		callback(null, res.cashouts);
	});
};

OPSkinsAPI.prototype.cancelPendingCashout = function(cashoutID, callback) {
	this._requireKey();
	this.post("ICashout", "CancelPendingCashout", 1, {"cashoutid": cashoutID}, function(err, res) {
		if (!callback) {
			return;
		}

		callback(err || null);
	});
};

OPSkinsAPI.prototype.requestPayPalCashout = function(amount, priority, callback) {
	if (typeof priority === 'function') {
		callback = priority;
		priority = false;
	}

	this._requireKey();
	this.post("ICashout", "RequestPayPal", 1, {"amount": amount, "priority": priority ? 1 : 0}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res.cashoutid, res.address, res.priority);
	});
};

OPSkinsAPI.prototype.requestBitcoinCashout = function(amount, callback) {
	this._requireKey();
	this.post("ICashout", "RequestBitcoin", 1, {"amount": amount}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res.cashoutid, res.address, res.priority);
	});
};

OPSkinsAPI.prototype.requestSkrillCashout = function(amount, callback) {
	this._requireKey();
	this.post("ICashout", "RequestSkrill", 1, {"amount": amount}, function(err, res) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null, res.cashoutid, res.address, res.skrill_txn_id, res.skrill_txn_status, res.skrill_txn_status_msg);
	});
};
