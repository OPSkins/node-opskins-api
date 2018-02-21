var OPSkinsAPI = require('../index.js');

OPSkinsAPI.prototype.addSubscription = function(sub_id, auto_renew, callback) {
	this._requireKey();
	if (typeof auto_renew === 'function') {
		callback = auto_renew;
		auto_renew = false;
	}
	this.post("IUser", "AddSubscription", 1, {
		"subscriptionid": sub_id,
		"auto_renew": auto_renew
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

OPSkinsAPI.prototype.getAccountSummary = function(callback) {
	this._requireKey();
	this.get("IUser", "GetAccountSummary", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getApiKeyDetails = function(callback) {
	this._requireKey();
	this.get("IUser", "GetApiKeyDetails", 1, function(err, res) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

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

OPSkinsAPI.prototype.getConvertibleBalance = function(cashoutable, callback) {
	this._requireKey();
	this.get("IUser", "GetConvertibleBalance", 1, {"cashoutable": cashoutable}, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getCredits = function(callback) {
	this._requireKey();
	this.get("IUser", "GetCredits", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.updateTradeURL = function(url, callback) {
	this._requireKey();
	this.post("IUser", "SaveTradeURL", 1, function(err, res, meta) {
		callback(err || null);
	});
};

OPSkinsAPI.prototype.getProfile = function(callback) {
	this._requireKey();
	this.get("IUser", "GetProfile", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSubscriptionsStatus = function(callback) {
	this._requireKey();
	this.get("IUser", "GetSubscriptionsStatus", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getSuggestionTypes = function(callback) {
	this._requireKey();
	this.get("IUser", "GetSuggestionTypes", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.getWhitelistStatus = function(callback) {
	this._requireKey();
	this.get("IUser", "GetWhitelistStatus", 1, function(err, res, meta) {
		if (err) {
			callback(err);
		} else {
			callback(null, res);
		}
	});
};

OPSkinsAPI.prototype.lockAccount = function(callback) {
	this._requireKey();
	this.post("IUser", "SelfLockAccount", 1, function(err) {
		if (!callback) {
			return;
		}

		if (err) {
			callback(err);
			return;
		}

		callback(null);
	});
};


OPSkinsAPI.prototype.toggleRenewSubscription = function(sub_id, callback) {
	this._requireKey();
	this.post("IUser", "ToggleRenewSubscription", 1, {"subscriptionid": sub_id}, function(err, res) {
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

OPSkinsAPI.prototype.updateProfile = function(params, callback) {
	this._requireKey();
	this.post("IUser", "UpdateProfile", 1, params, function(err, res) {
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

OPSkinsAPI.prototype.updateSMSPhoneNumber = function(phone, login_verification, callback) {
	this._requireKey();
	if (typeof login_verification === 'function') {
		callback = login_verification;
		login_verification = false;
	}
	this.post("IUser", "UpdateSMSPhoneNumber", 1, {
		"sms_phone": phone,
		"phone_login_verification": login_verification
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


OPSkinsAPI.prototype.verifyPhoneCode = function(code, callback) {
	this._requireKey();
	this.post("IUser", "VerifyPhoneCode", 1, {"code": code}, function(err, res) {
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
