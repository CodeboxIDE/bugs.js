var Q = require('q');
var _ = require('lodash');

var bugs = require('../');

if(!process.argv[2]) {
    console.log('Please specify a python file to debug');
    process.exit();
}

// Use pdb to debug a python file
// the file is supplied via a command line arg
var dbg = bugs.pdb(process.argv[2]);

var log = function(name) {
    return function(x) {
        console.log(name+' =', x);
    };
};

// Run all our debug stuff in series
[
    _.partial(dbg.break, 'main'),
    dbg.run,
    dbg.backtrace,
    log('trace'),
    dbg.step,
    dbg.locals,
    log('locals'),
    dbg.quit
].reduce(Q.when, dbg.init())
.done();