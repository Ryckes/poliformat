
;(function(exports) {

    if(typeof Promise === 'undefined')
        Promise = require('bluebird');

    var parse = function(data) {
        return new DOMParser().parseFromString(data, 'text/html');
    };

    var PORTAL_URL = 'https://poliformat.upv.es/portal';
    var FILES_URL = 'https://poliformat.upv.es/access/content/';

    var promisedAjax = function(ajax) {
        return function(opts) {
            return new Promise(function(resolve, reject) {
                opts.success = resolve;
                opts.fail = reject;
                ajax(opts);
            });
        };
    };

    function fetchFiles(subjectCode, folder, backPath, ajax) {
        var req = promisedAjax(ajax);
        $('#fileList').html('');
        $('#folderList').html('');

        return req({url: FILES_URL + subjectCode + folder})
            .then(function(data) {
                var containerFolder = folder.substring(0, folder.substring(0, folder.lastIndexOf('/')).lastIndexOf('/') + 1);

                if(containerFolder)
                    $('#folderList').append('<a class="itemLink folder containerFolder" data-subject="' + subjectCode + '" data-path="' + containerFolder + '" href="">Volver</a>');

                var html = parse(data);
                var elements = html.getElementsByTagName('li');

                for(var element in elements) {
                    if(elements.hasOwnProperty(element)) {
                        var item = elements[element];

                        if(item.className === 'file' ||
                           item.className === 'folder') {
                            var type = item.className;

                            var href = decodeURIComponent(item.children[0].attributes[0].value);
                            $('#' + item.className + 'List').append('<a class="itemLink ' + type + '" data-subject="' + subjectCode + '" data-path="' + folder + href + '" href="">' + item.innerText + '</a>');
                        }
                    }
                }
                $('#itemList .itemLink').click(function(e) {

                    if($(this).hasClass('folder')) {
                        fetchFiles($(this).data('subject'), $(this).data('path'), folder, ajax);
                    }
                    else {
                        chrome.tabs.create({url: FILES_URL + $(this).data('subject') + $(this).data('path')});
                    }
                    
                    e.preventDefault();
                });
            }, function(err) {
                console.log('Error: ' + err);
            });
    }

    function fetchSubjectList(ajax) {
        var req = promisedAjax(ajax);

        return req({url: PORTAL_URL})
            .then(function(data) {
                var regexp = /"https:\/\/poliformat.upv.es\/portal\/site\/([^"]+)" title="([^:"]+):/g,
                    match;

                var subjects = [];
                
                while((match = regexp.exec(data))) {
                    var subject = {};
                    subject.code = match[1];
                    subject.name = match[2];
                    subjects.push(subject);
                }

                return subjects;
            }, function(err) {
                console.error('Could not load subject list: ', err);
            });
    }

    exports.fetchFiles = fetchFiles;
    exports.fetchSubjectList = fetchSubjectList;
    
}(typeof exports === 'undefined'? this : exports));
