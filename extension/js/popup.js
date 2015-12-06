
;(function(exports) {

    var $loginFormContainer, $loginForm, $saveFormButton,
        $status, $optionList, $navList,
        $subPortalList, $fileList;

    var portalData, whitelistedOptions;

    var poliformat,
        DOM, settings, login,
        view, ajaxMethod;

    function setStatus(txt) {
        $status.text(txt);
        if(!txt) $status.hide();
        else $status.show();
    }

    function appendToStatusLogoutButton() {
        $status.append('<br /><button id="logoutButton">Logout</button>');
        $status.find('#logoutButton').click(logout);
    }

    function getUPVCookieDetails() {
        var userCookie = {};
        userCookie.url = 'http://www.upv.es';
        userCookie.name = 'TDp';

        return userCookie;
    }

    function getPoliformaTCookieDetails() {
        var userCookie = {};
        userCookie.url = 'https://poliformat.upv.es';
        userCookie.name = 'JSESSIONID';

        return userCookie;
    }

    function showLoggedOutStatus(settings, view) {
        settings.setLoggedOutBadge();
        setStatus('');
        view.showLoginForm();
    }

    function showLoggedInStatus(settings, view) {
        settings.setLoggedInBadge();

        // setStatus('Correctly logged in.');
        setStatus('');

        // TODO Logout button
        // appendToStatusLogoutButton();

        view.hideLoginForm();
        view.showNav();
    }

    function getDNI() {
        return $('#inputDNI').val();
    }

    function getPin() {
        return $('#inputPin').val();
    }

    function forceCheckLogIn(login, settings, view, poliformat) {
        checkLogIn(true, login, settings, view, poliformat);
    }

    function checkLogIn(forceCheck, login, settings, view, poliformat) {
        setStatus('Checking login...');
        login.isLoggedIn(forceCheck)
            .then(function(loggedIn) {
	            if(loggedIn) {
	                setStatus('Logged in');
	                // console.log("I am logged in");
	                showLoggedInStatus(settings, view);
	                // processPortalData();

                    poliformat.getSubjectList(ajaxMethod)
                        .then(function(subjects) {
                            view.displaySubjects(subjects);
                        });
	            }
	            else {
	                setStatus('Not logged in');
	                // console.log("Not logged in");
	                showLoggedOutStatus(settings, view);

                    if(settings.autologin) {
                        login.getLoginData().then(function(data) {
                            performLogin(login, data.dni, data.pass, settings, view, poliformat);
                        });
                    }
	            }

            }, function(err) {
	            setStatus('Error checking login: ' + err);
            });
    }

    function performLogin(login, dni, pass, settings, loginForm, view, poliformat) {
        var promise = login.logIn(dni, pass);

        promise.then(function() {

            forceCheckLogIn(login, settings, loginForm, view, poliformat);

        }, function(err) {
	        console.error("Login failed: ", err);
        });
    }

    function logout() {
        chrome.cookies.remove(getPoliformaTCookieDetails(), forceCheckLogIn);
        chrome.cookies.remove(getUPVCookieDetails(), forceCheckLogIn);
    }

    function processPortalData(data, title) {
        data = data || poliformat.mainData;
        if(!data) return;

        try {
	        // Remove image elements so jQuery doesn't try to fetch them
	        // RegExp here is slow and not safe
	        var $data = $(data.replace(/<img[^>]*>/g));
        }
        catch(ex) {
	        console.error("Error parsing the portal data.");
        }

        $data.find('iframe').each(function() {
	        switchToSubPortal($(this).attr('src'));
        });

        var $navMenu = $data.find('#topnav .nav-menu');
        $navList.html('');
        $navList.append('<ul>');
        var classes, link;
        $navMenu.each(function() {
	        classes = 'portal';
	        if($(this).hasClass('nav-selected')) classes += ' selected-portal';
	        else link = $(this).find('a').attr('href');
	        $navList.append('<li class="' + classes + '" data-href="' + link + '">' + $(this).text() + '</a></li>');
        });
        $navList.append('</ul>');

        $navList.find('li').each(function() {
	        $(this).click(function() {
	            switchToPortal($(this).data('href'));
	        });
        });

        $optionList.html('');
        $optionList.append('<ul>');
        $data.find('.toolMenuLink').each(function() {
	        var option = $(this).text().trim();

	        link = $(this).attr('href');
	        if(!link) return;
	        for(var op in whitelistedOptions) {
	            if(new RegExp(whitelistedOptions[op]).exec(option)) {
		            $optionList.append('<li><a href="" data-href="' + link + '">' + option  + '</a></li>');
		            break;
	            }
	        }
        });
        $optionList.append('</ul>');

        $optionList.find('li a').click(function() {
	        var text = $(this).text();
	        switchToPortal($(this).data('href'));

	        return false;
        });
    }

    function processSubPortalData(data) {
        try {
	        // Remove image elements so jQuery doesn't try to fetch them
	        // RegExp here is slow and not safe
	        var $data = $(data.replace(/<img[^>]*>/g));
        }
        catch(err) {
	        console.error('Error parsing the data of the sub portal');
	        return;
        }
        
        $fileList.html('');
        $subPortalList.html('');
        $fileList.append('<ul>');
        $subPortalList.append('<ul>');
        var url = $data.find('form').attr('action');

        $data.find('table.listHier [headers=title] a').each(function() {
	        var text = $(this).text().trim();
	        
	        if(text) {
	            if($(this).attr('title') === 'Carpeta') {
		            var id = $(this).attr('onclick').match(/collectionId'\)\.value='([^']+)'/);
		            if(id) id = id[0];
		            else return true;

		            $subPortalList.append('<li data-id="' + id + '"><img src="https://poliformat.upv.es/library/image/sakai/dir_closed.gif" />' + $(this).text() + '</li>');
	            }
	            else {
		            $fileList.append('<li>' + text + '</li>');
	            }
	        }
        });

        $fileList.append('</ul>');
        $subPortalList.append('</ul>');

        $subPortalList.find('li').click(function() {
	        var ajaxOptions = {"type":"POST", "url": url, "data":{"source":"0","collectionId": $(this).data('id'),"navRoot":"","criteria":"title","sakai_action":"doExpandall","rt_action":"","selectedItemId":"","option":"x","sakai_csrf_token":"db9716e88e60720e2e03b3d08764c0eb45f5cd34aaae9ab7faffa346bb44eeec"}, success: processSubPortalData};
	        $.ajax(ajaxOptions);
        });
    }

    function switchToPortal(link) {
        $.ajax(link, {
	        success: processPortalData,
	        error: function(err) {
	            setStatus("Error connecting to " + link);
	        }
        });
    }

    function switchToSubPortal(link) {
        $.get(link).done(processSubPortalData);
    }

    function fillFormIfAvailable(login, view) {
        login.getLoginData().then(function(data) {
            view.fillLoginForm(data.dni, data.pass);
        });
    }

    function saveForm(login) {
        var dni = $('#inputDNI').val();
        var pass = $('#inputPin').val();
        login.saveLoginData(dni, pass);
    }

    function initialize(settingsLocal, loginLocal, viewLocal, poliformatLocal, ajaxMethodLocal) {
        settings = settingsLocal;
        login = loginLocal;
        view = viewLocal;
        DOM = view.getDOM();
        poliformat = poliformatLocal;
        ajaxMethod = ajaxMethodLocal;
    }

    function start() {
        var document = view.getDOM();
        $loginFormContainer = document.$loginFormContainer;
        $loginForm = document.$loginForm;
        $saveFormButton = document.$saveFormButton;
        $status = document.$status;
        $optionList = document.$optionList;
        $navList = document.$navList;
        $subPortalList = document.$subPortalList;
        $fileList = document.$fileList;

        setStatus('');
        checkLogIn(false, login, settings, view, poliformat);

        $loginForm.submit(function(e) {
            performLogin(login, getDNI(), getPin(), settings, view, poliformat);

            e.preventDefault();
        });
        $saveFormButton.click(saveForm.bind(null, login));

        fillFormIfAvailable(login, view);
    };

    exports.initialize = initialize;
    exports.start = start;

}(typeof exports === 'undefined'? this : exports));
