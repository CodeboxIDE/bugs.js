// HTML controls
var $dbgIn = document.getElementById('dbg-in');
var $dbgOut = document.getElementById('dbg-out');

var $breakIn = document.getElementById('break-in');
var $breakOut = document.getElementById('break-out');

var $localsOut = document.getElementById('locals-out');

// Node requires
var Q = require('q');
var _ = require('lodash');

var path = require('path');

var bugs = require('../');

function debug() {
// Use pdb to debug a python file
// the file is supplied via a command line arg
var dbg = bugs.pdb(path.join('../test/hello.py'));

var getState = function() {
    console.log('Getting state');
    return Q.all([
        dbg.breakpoints(),
        dbg.locals()
    ])
    .spread(function(bkps, locals) {
        console.log('Got state');
        return {
          breakpoints: bkps,
          locals: locals
        };
    })
    .fail(function(err) {
        console.log('Failed to get state =', err);
        throw err;
    });
}

var setLocals = function(locals) {
    var text = _.map(locals, function(key, value) {
        return [key, value].join(' = ');
    }).join('\n');
    
    console.log('locals text =', text);
    
    // Set value
    $localsOut.textContent = text;
};

var setBreakpoints = function(bkps) {
    bkps = _.isString(bpks) ? [bpks] : bpks;
    $breakOut.textContent = _.map(bkps, function(bkp) {
        return bkp;
    }).join('\n')
};

var updateState = function() {
    console.log('Going to update state');
    return getState()
    .then(function(state) {
        console.log('updating state =', state);
        setBreakpoints(state.breakpoints);
        setLocals(state.locals);
    })
    .done();
};

// A utility method for generating log functions that can be run in series
var log = function(name) {
    var el = document.getElementById(name);
    return function(x) {
        console.log(name, x);
        var data = typeof x === 'string' ? x : JSON.stringify(x);
        el.textContent = data;
        updateState();
    };
};

// Run all our debug stuff in series
[
    _.partial(dbg.break, '17'),
    function () { return dbg.run(); },
    dbg.list,
    log('source-out'),
    dbg.continue,
    dbg.locals,
    log('locals-out'),
    dbg.list,
    log('source-out'),
    dbg.quit
].reduce(Q.when, dbg.init())
.done(function() {
    console.log('DONE');
});

}
