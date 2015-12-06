
;(function(exports) {

    var fetch, DOM;

    function initialize(fetchLocal, DOMLocal) {
        fetch = fetchLocal;
        DOM = DOMLocal;
    }
    
    function getDOM() {
        if(DOM) return DOM;
        else
            return {
                $loginFormContainer: $('#loginFormContainer'),
                $loginForm: $('#loginForm'),
                $saveFormButton: $('#saveFormButton'),
                $status: $('#status'),
                $optionList: $('#optionList'),
                $navList: $('#navList'),
                $folderList: $('#folderList'),
                $fileList: $('#fileList'),
                $subjectList: $('#subjectList')
            };
    }

    function resetSubjectList() {
        DOM.$subjectList.html('<br />');
    }

    function addSubject(subject) {
        var html = '';
        html += '<a class="subjectLink" href="" data-code="' + subject.code + '">' + subject.name + '</a>';
        
        DOM.$subjectList.append(html);
    }

    exports.displaySubjects = function(subjects) {
        resetSubjectList();
        for(var subjectIndex in subjects) {
            if(subjects.hasOwnProperty(subjectIndex))
                addSubject(subjects[subjectIndex]);
        }

        $('.subjectLink').click(function(e) {
            fetch.fetchFiles($(this).data('code'), '/', false, $.ajax)
                .then(function(data) {
                    
                }, function(err) {
                    console.log('Error: ', err);
                });
            
            // e.preventDefalt();
            return false;
        });
    };

    function fillLoginForm(dni, pass) {
        $('#inputDNI').val(dni);
        $('#inputPin').val(pass);
    }

    function showLoginForm() {
        $('#loginFormContainer').show();
    }

    function hideLoginForm() {
        $('#loginFormContainer').hide();
    }

    exports.initialize = initialize;
    exports.getDOM = getDOM;
    exports.showNav = function() {
        $('#nav').show();
    };
    exports.fillLoginForm = fillLoginForm;
    exports.showLoginForm = showLoginForm;
    exports.hideLoginForm = hideLoginForm;

}(typeof exports === 'undefined'? this : exports));
