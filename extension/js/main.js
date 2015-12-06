
var popup = require('./popup'),
    poliformat = require('./poliformat'),
    view = require('./view'),
    fetch = require('./fetch');


$(document).ready(function() {

    poliformat.initialize($.ajax);
    view.initialize(fetch, view.getDOM());
    popup.initialize(poliformat.settings, poliformat.login, view,
                     poliformat.poliformat, $.ajax);
    
    popup.start(poliformat.login, poliformat.settings, view, poliformat.poliformat, $.ajax);

});