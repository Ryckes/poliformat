
var popup = require('../extension/js/popup'),
    chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    spies = require('chai-spies'),
    chaiAsPromised = require('chai-as-promised'),
    Promise = require('bluebird');

// TODO Check in smaller intervals and pass the test as soon as the
// condition holds
var asyncTestsTimeout = 150;

chai.use(chaiAsPromised);
chai.use(spies);

describe('PoliformaT', function() {

    describe('popup', function() {

        function spy(object, method) {
            // For simplicity and better error output
            object[method] = chai.spy(method, object[method]);
        }

        var DOMMock,
            settingsMock,
            loginMock,
            viewMock,
            poliformatMock;

        beforeEach(function() {

            DOMMock = {};
            settingsMock = {};
            loginMock = {};
            viewMock = {};
            poliformatMock = {};


            settingsMock.setLoggedInBadge = function() {};
            settingsMock.setLoggedOutBadge = function() {};

            DOMMock.$status = {
                text: function() {},
                hide: function() {},
                show: function() {}
            };
            DOMMock.$loginForm = {
                submit: function() {}
            };
            DOMMock.$loginFormContainer = {
                hide: function() {}
            };
            DOMMock.$saveFormButton = {
                click: function() {}
            };

            // Not logged in by default
            loginMock.logged = false;
            loginMock.logInSuccessfully = true;
            loginMock.isLoggedIn = function(forceCheck) {
                return Promise.resolve(this.logged);
            };
            loginMock.loginData = null;
            loginMock.getLoginData = function() {
                var that = this;

                // No Promise, so it's immediate
                return {
                    then: function(fn) {
                        if(!that.loginData)
                            fn('', '');
                        else
                            fn(that.loginData.dni,
                               that.loginData.pass);
                    }
                };
            };
            loginMock.logIn = function() {
                var that = this;
                return new Promise(function(resolve, reject) {
                    if(that.logInSuccessfully) {
                        loginMock.logged = true;
                        resolve();
                    }
                    else {
                        loginMock.logged = false;
                        reject();
                    }
                });
            };

            viewMock.fillLoginForm = function() {};
            viewMock.showLoginForm = function() {};
            viewMock.hideLoginForm = function() {};
            viewMock.showNav = function() {};
            viewMock.displaySubjects = function(subjects) {
            };
            viewMock.getDOM = function() {
                return DOMMock;
            };

            poliformatMock.subjectList = [];
            poliformatMock.getSubjectList = function() {
                return {
                    then: function(fn) {
                        fn(poliformatMock.subjectList);
                    }
                };
            };

            popup.initialize(settingsMock, loginMock, viewMock, poliformatMock, function() {});
        });

        it('should show login form if there is no saved login data and the user is not already logged in', function(done) {
            // Arrange
            spy(viewMock, 'showLoginForm');
            loginMock.logged = false;
            loginMock.loginData = null;

            // Act
            popup.start();

            // Assert
            setTimeout(function() {
                // Promises are used
                // Asynchrony must be handled
                expect(viewMock.showLoginForm).to.have.been.called();
                done();
            }, asyncTestsTimeout);
        });

        it('should not show login form if the user is already logged in', function() {
            // Arrange
            spy(viewMock, 'showLoginForm');
            loginMock.logged = true;

            // Act
            popup.start();

            // Assert
            expect(viewMock.showLoginForm).to.not.have.been.called();
        });

        it('should attempt to log in automatically if the user is not logged in and there is saved login data and automatic login is enabled', function(done) {
            // Arrange
            settingsMock.autologin = true;
            loginMock.logged = false;
            loginMock.logInSuccessfully = true;
            spy(loginMock, 'logIn');
            
            // Act
            popup.start(loginMock, settingsMock, viewMock, poliformatMock);
            
            // Assert
            setTimeout(function() {
                expect(loginMock.logIn).to.have.been.called();
                done();
            }, asyncTestsTimeout);
        });

        it('should not attempt to log in automatically if the user is not logged in and there is saved login data but automatic login is disabled', function() {
            // Arrange
            settingsMock.autologin = false;
            loginMock.logged = false;
            loginMock.logInSuccessfully = true;
            spy(loginMock, 'logIn');
            
            // Act
            popup.start(loginMock, settingsMock, viewMock, poliformatMock);
            
            // Assert
            expect(loginMock.logIn).to.not.have.been.called();
        });


        it('should not attempt to log in automatically if the user is already logged in', function() {
            // Arrange
            settingsMock.autologin = true;
            loginMock.logged = true;
            loginMock.logInSuccessfully = true;
            spy(loginMock, 'logIn');
            
            // Act
            popup.start(loginMock, settingsMock, viewMock, poliformatMock);
            
            // Assert
            expect(loginMock.logIn).to.not.have.been.called();
        });

        it('should ask for subject list if the user is logged in', function(done) {
            // Arrange
            loginMock.logged = true;
            spy(poliformatMock, 'getSubjectList');
            
            // Act
            popup.start(loginMock, settingsMock, viewMock, poliformatMock);
            
            // Assert
            setTimeout(function() {
                expect(poliformatMock.getSubjectList).to.have.been.called();
                done();
            }, asyncTestsTimeout);
        });

        it('should fetch files of a subject on click in a subject', function() {
            // Arrange
            loginMock.logged = true;
            poliformatMock.subjectList = [{
                code: 'SBJ',
                name: 'Subject'
            }, {
                code: 'OSB',
                name: 'Other subject'
            }];
            
            // Act
            popup.start(loginMock, settingsMock, viewMock, poliformatMock);
            
            // Assert
            
        });


    });

});