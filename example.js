var OPSkinsAPI = require('./index.js'); // Change this to require('@opskins/api') when installing from npm
var opskins = new OPSkinsAPI('121fde9bb5f984c52eae51edce7e27');

opskins.getSteamID(function(err, steamID) {
	if (err) {
		console.log("Error:");
		console.log(err.message);
	} else {
		console.log("My SteamID is: " + steamID);
	}
});
