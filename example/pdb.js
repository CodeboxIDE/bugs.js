var Q = require('q');
var _ = require('lodash');

var path = require('path');

var bugs = require('../');


// Use pdb to debug a python file
// the file is supplied via a command line arg
var dbg = bugs.pdb(path.join(__dirname, '../test/hello.py'));

// A utility method for generating log functions that can be run in series
var log = function(name) {
    return function(x) {
        console.log(name+' =', x);
    };
};

// Run all our debug stuff in series
[
    _.partial(dbg.break, '17'),
    function () { return dbg.run(); },
    dbg.breakpoints,
    log('breakpoints'),
    dbg.kill,
    log('kill'),
].reduce(Q.when, dbg.init())
.done();
