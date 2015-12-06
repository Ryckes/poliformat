
;(function(exports) {

    if(typeof Promise === 'undefined')
        var Promise = require('bluebird');

    var ajaxFunction;

    var initialize = function(ajaxFunctionLocal) {
        ajaxFunction = ajaxFunctionLocal;
    };

    var settings = {

        autologin: true,
        
        loginCheckInterval: 10*60*1000, // 10 minutes

        poliformatUrl: 'https://poliformat.upv.es/portal',

        setLoggedOutBadge: function() {
	        chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' });
	        chrome.browserAction.setBadgeText({ text: "Off" });
        },
        setLoggedInBadge: function() {
	        chrome.browserAction.setBadgeBackgroundColor({ color: '#00FF00' });
	        chrome.browserAction.setBadgeText({ text: "On" });
        }
    };

    // State
    var poliformat = (function() {

        var fetch = require('./fetch');

        var subjectList = null,
            updateCounter = null,
            updateInterval = 0,
            periodicUpdates = false;

        function intervalElapsed() {
            return (new Date() - updateCounter) >= updateInterval;
        }

        function retrieveSubjects(ajaxMethod) {
            return fetch.fetchSubjectList(ajaxMethod);
        }

        return {
            enablePeriodicUpdates: function() {
                periodicUpdates = true;
            },
            loggedIn: false,
            loggedInTime: -1,
            mainData: null,
            mainDataTime: -1,
            getSubjectList: function(ajaxMethod) {
                return new Promise(function(resolve, reject) {
                    if(!subjectList || (periodicUpdates && intervalElapsed()))
                        resolve(retrieveSubjects(ajaxMethod));
                    else
                        resolve(subjectList);
                });
            },
            resetUpdateCounter: function(date) {
                updateCounter = date;
            },
            setSubjectList: function(list) {
                subjectList = list;
            },
            setUpdateInterval: function(interval) {
                updateInterval = interval;
            }
        };

    }());

    // Logic
    var login = {
        /*
         * Arguments: bool forceCheck
         * Behavior:
         * If forceCheck is false AND the time elapsed since last
         * login time is lower than the specified loginCheckInterval,
         * do not query PoliformaT and return an immediately fulfilled
         * promise (with whichever login state it was).
         * 
         * If any of those conditions is false, perform a query and
         * return a promise, parse the response, store login state and
         * fulfil the promise with whatever login state it is.
         * 
         * If case of error, reject the promise.
         */
        isLoggedIn: function(forceCheck) {

            return new Promise(function(resolve, reject) {
                
	            if(!forceCheck && (new Date().getTime() - poliformat.loggedInTime) < settings.loginCheckInterval) {
                    resolve(poliformat.loggedIn);
                    return;
	            }

	            resolve(new Promise(function(resolveAjax, rejectAjax) {

                    ajaxFunction(settings.poliformatUrl, {
	                    success: resolveAjax,
	                    error: rejectAjax
	                });

                }).then(function(data) {

	                // This expression appears if the user is not logged in to PoliformaT
	                var loggedIn = !(/"loggedIn": false/.exec(data));

	                var time = new Date().getTime();

	                poliformat.loggedIn = loggedIn;
	                poliformat.loggedInTime = time;

	                if(loggedIn) {
		                poliformat.mainData = data;
		                poliformat.mainDataTime = time;
	                }

	                return loggedIn;
	            }));
            });
        },

        logIn: function(dni, pin) {
            if(typeof dni === 'undefined' ||
               typeof pin === 'undefined')
                throw new Error('Wrong arguments');
            
	        var options = {"type":"POST","url":"https://www.upv.es/exp/aute_intranet","data":{"id":"c","estilo":"500","vista":"","param":"","cua":"miupv","dni": dni,"clau": pin}};

            return new Promise(function(resolve, reject) {

	            options.success = function() {
	                $.get('https://poliformat.upv.es/portal/login').done(resolve).fail(reject);
	            };

	            $.ajax(options).fail(reject);
            });
        },

        getLoginData: function() {
            return new Promise(function(resolve) {
	            chrome.storage.sync.get(function(data) {
                    resolve(data);
	            });
            });
        },

        saveLoginData: function(dni, pin) {
	        chrome.storage.sync.set({dni: dni, pass: pin});
        }
    };

    exports.initialize = initialize;
    exports.settings = settings;
    exports.poliformat = poliformat;
    exports.login = login;
    
}(typeof exports === 'undefined'? this : exports));

