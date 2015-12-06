

var poliformatModule = require('../extension/js/poliformat'),
    poliformat = poliformatModule.poliformat,
    chai = require('chai'),
    expect = chai.expect,
    spies = require('chai-spies'),
    Promise = require('bluebird');

chai.use(spies);

describe('PoliformaT module', function() {

    beforeEach(function() {
        

    });

    describe('#getSubjectList()', function() {

        it('should attempt to fetch the subjects using AJAX if there is no stored information', function() {
            // Arrange
            var AJAXMock = chai.spy('AJAXMock');
            poliformat.setSubjectList(null);
            
            // Act
            poliformat.getSubjectList(AJAXMock);
            
            // Assert
            expect(AJAXMock).to.have.been.called();
        });

        it('should not attempt to fetch the subjects using AJAX if there is stored information', function() {
            // Arrange
            var AJAXMock = chai.spy('AJAXMock');
            poliformat.setSubjectList([]);

            // Act
            poliformat.getSubjectList(AJAXMock);
            
            // Assert
            expect(AJAXMock).to.not.have.been.called();
        });

        it('should attempt to fetch the subjects using AJAX if there is stored information but periodic update is enabled and the interval has elapsed', function() {
            // Arrange
            var AJAXMock = chai.spy('AJAXMock');
            poliformat.setSubjectList([]);
            poliformat.enablePeriodicUpdates();
            poliformat.setUpdateInterval(5*24*60*60*1000); // 5 days
            var lastWeekDate = new Date();
            lastWeekDate.setTime(lastWeekDate.getTime() - 7*24*60*60*1000);
            poliformat.resetUpdateCounter(lastWeekDate);
            
            // Act
            poliformat.getSubjectList(AJAXMock);
            
            // Assert
            expect(AJAXMock).to.have.been.called();
        });

        it('should not attempt to fetch the subjects using AJAX if there is stored information and periodic update is enabled but the interval has not elapsed', function() {
            // Arrange
            var AJAXMock = chai.spy('AJAXMock');
            poliformat.setSubjectList([]);
            poliformat.enablePeriodicUpdates();
            poliformat.setUpdateInterval(5*24*60*60*1000); // 5 days
            var lastWeekDate = new Date();
            lastWeekDate.setTime(lastWeekDate.getTime() - 4*24*60*60*1000);
            poliformat.resetUpdateCounter(lastWeekDate);
            
            // Act
            poliformat.getSubjectList(AJAXMock);
            
            // Assert
            expect(AJAXMock).to.not.have.been.called();
        });


    });
});

describe('login module', function() {
    
    describe('#isLoggedIn()', function() {

        it('should reject the returned promise if ajax function throws an error', function() {
            // Arrange
            var AJAXMock = function() { throw new Error('Testing method behavior'); };
            poliformatModule.initialize(AJAXMock);
            var forceCheck = true;
            
            // Act
            var promise = poliformatModule.login.isLoggedIn(forceCheck);
            
            // Assert
            return promise.should.be.rejected;
        });

        it('should reject the returned promise if ajax function calls error callback', function() {
            // Arrange
            var AJAXMock = function(url, opts) { opts.error(); };
            poliformatModule.initialize(AJAXMock);
            var forceCheck = true;
            
            // Act
            var promise = poliformatModule.login.isLoggedIn(forceCheck);
            
            // Assert
            return promise.should.be.rejected;
        });

        it('should resolve the returned promise with true if ajax function answers with a page not containing "loggedIn": false', function() {
            // Arrange
            var AJAXMock = function(url, opts) { opts.success(''); };
            poliformatModule.initialize(AJAXMock);
            var forceCheck = true;
            
            // Act
            var promise = poliformatModule.login.isLoggedIn(forceCheck);
            
            // Assert
            return promise.should.become(true);
        });

        it('should resolve the returned promise with false if ajax function answers with a page containing "loggedIn": false', function() {
            // Arrange
            var AJAXMock = function(url, opts) { opts.success('some gibberish ... "loggedIn": false ...'); };
            poliformatModule.initialize(AJAXMock);
            var forceCheck = true;
            
            // Act
            var promise = poliformatModule.login.isLoggedIn(forceCheck);
            
            // Assert
            return promise.should.become(false);
        });

        it('should not call ajax function if forceCheck is false, poliformat.loggedInTime is set to current date and settings.loginCheckInterval is large enough', function() {
            // Arrange
            var AJAXMock = chai.spy();
            poliformatModule.initialize(AJAXMock);
            var forceCheck = false;
            poliformat.loggedInTime = Date.now();
            poliformatModule.settings.loginCheckInterval = 1000 * 60 * 10;
            
            // Act
            poliformatModule.login.isLoggedIn(forceCheck);
            
            // Assert
            AJAXMock.should.not.have.been.called();
        });

        it('should call ajax function if forceCheck is false, poliformat.loggedInTime is set to current date minus five minutes, and settings.loginCheckInterval is one minute', function() {
            // Arrange
            var AJAXMock = chai.spy();
            poliformatModule.initialize(AJAXMock);
            var forceCheck = false;
            poliformat.loggedInTime = Date.now() - 1000 * 60 * 5;
            poliformatModule.settings.loginCheckInterval = 1000 * 60;
            
            // Act
            poliformatModule.login.isLoggedIn(forceCheck);
            
            // Assert
            AJAXMock.should.have.been.called();
        });



    });
});
/*
 it('should attempt to fetch subject list if the user is already logged in and there is no information about subjects', function() {
 // Arrange
 loginMock.logged = true;
 poliformatMock.subjects = null;
 spy(poliformatMock, 'getSubjectList');
 
 // Act
 popup.start(DOMMock, loginMock, settingsMock, loginFormMock, viewMock, poliformatMock);
 
 // Assert
 expect(poliformatMock.getSubjectList).to.have.been.called();
 });

 it('should attempt to fetch subject list if the user is already logged in and there is information about subjects if periodic update is enabled and the interval has elapsed', function() {
 // Arrange
 loginMock.logged = true;
 poliformatMock.subjects = [];
 spy(poliformatMock, 'getSubjectList');
 poliformatMock.subjectsNeedRefresh = function() { return true; };
 
 // Act
 popup.start(DOMMock, loginMock, settingsMock, loginFormMock, viewMock, poliformatMock);
 
 // Assert
 expect(poliformatMock.getSubjectList).to.have.been.called();
 });

 it('should not attempt to fetch subject list if the user is already logged in and there is information about subjects if periodic update is enabled but the interval has not elapsed yet', function() {
 // Arrange
 loginMock.logged = true;
 poliformatMock.subjects = [];
 spy(poliformatMock, 'getSubjectList');
 poliformatMock.subjectsNeedRefresh = function() { return false; };
 
 // Act
 popup.start(DOMMock, loginMock, settingsMock, loginFormMock, viewMock, poliformatMock);
 
 // Assert
 expect(poliformatMock.getSubjectList).to.not.have.been.called();
 });
 */
