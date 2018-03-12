"use strict";
module.exports = config;

function config(app,swig){
    
    swig.setDefaults({ cache: false });

    app.engine('html', swig.renderFile);

    app.set('view engine', 'html');
}