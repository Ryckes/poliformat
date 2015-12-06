
var poliformat = require('./poliformat'),
    login = poliformat.login,
    settings = poliformat.settings;

poliformat.initialize($.ajax.bind($));

function checkLogin(preventAutologin) {
    console.log("Checking login...");
    login.isLoggedIn(false)
        .then(function(loggedIn) {
	        if(loggedIn) {
	            settings.setLoggedInBadge();
	        }
	        else {
	            settings.setLoggedOutBadge();

	            if(!preventAutologin && settings.autologin) {
		            login.getLoginData()
                        .then(function(data) {
		                    login.logIn(data.dni, data.pass)
                                .then(function() {
			                        checkLogin(true);
		                        }, function(err) {
			                        console.error("Could not auto log in");
		                        });
		                }, function() {
                            console.error("Could not obtain login data");
                        });
	            }
	        }
        }, function(e) {
            console.error("Could not check logins status: %s", e);
        });
}

console.log("Setting up login check task");
checkLogin();
setInterval(checkLogin, settings.loginCheckInterval);
