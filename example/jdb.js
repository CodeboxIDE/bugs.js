var Q = require('q');
var _ = require('lodash');

var path = require('path');

var bugs = require('../');


// Use pdb to debug a python file
// the file is supplied via a command line arg
var dbg = bugs.jdb(path.join(__dirname, '../test/HelloWorld.class'));

// A utility method for generating log functions that can be run in series
var log = function(name) {
    return function(x) {
        console.log(name+' =', x);
    };
};

dbg.stream.pipe(process.stderr);

// Run all our debug stuff in series
[
    _.partial(dbg.break, 'HelloWorld:10'),
    function () { return dbg.run(); },
    dbg.breakpoints,
    log('breakpoints'),
    dbg.kill
].reduce(Q.when, dbg.init())
.done();
