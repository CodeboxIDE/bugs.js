// HTML controls
var $dbgIn = document.getElementById('dbg-in');
var $dbgOut = document.getElementById('dbg-out');

var $breakIn = document.getElementById('break-in');
var $breakOut = document.getElementById('break-out');

var $localsOut = document.getElementById('locals-out');
var $stacksOut = document.getElementById('stacks-out');

var $err = document.getElementById('err-out');

// Buttons controlling flow
var CONTROLS = [
"start",
"stop",
"next",
"continue",
"restart",
];


// Node requires
var Q = require('q');
var _ = require('lodash');

var path = require('path');

var bugs = require('../');

// Dirty main function
function debug() {
// Use pdb to debug a python file
// the file is supplied via a command line arg
var dbg = bugs.pdb(path.join('../test/hello.py'));

var getState = function() {
    console.log('Getting state');
    return Q.all([
        dbg.breakpoints(),
        dbg.locals(),
        dbg.backtrace(),
    ])
    .spread(function(bkps, locals, stacks) {
        console.log('Got state');
        return {
            breakpoints: bkps,
            locals: locals,
            stacks: stacks,
        };
    })
    .fail(function(err) {
        console.log('Failed to get state =', err);
        throw err;
    });
}

var setLocals = function(locals) {
    var text = _.map(locals, function(value, key) {
        return [key, value].join(' = ');
    }).join('\n');
    
    console.log('locals text =', text);
    
    // Set value
    $localsOut.textContent = text;
};

var setBreakpoints = function(bkps) {
    bkps = _.isString(bkps) ? [bkps] : bkps;
    $breakOut.textContent = _.map(bkps, function(bkp) {
        return [bkp.num, bkp.location.filename, bkp.location.line].join(' ');
    }).join('\n')
};

var setStacks = function(stacks) {
    process.stderr.write('\n'+JSON.stringify(stacks)+'\n');
    var text = _.map(stacks, function(location) {
        return [location.filename, location.line].join(' ');
    }).join('\n');
    $stacksOut.textContent = text;
};

var updateState = function() {
    return getState()
    .then(function(state) {
        setBreakpoints(state.breakpoints);
        setLocals(state.locals);
        setStacks(state.stacks);
    });
};

var showError = function(err) {
    console.log('GOT ERROR');
    $err.textContent = err ? (err.stack || err) : '';
};

var hookupControl = function(dbg, name) {
    var el = document.getElementById(['btn', name].join('-'));
    if(!el) return;
    
    // Do action on click
    el.onclick = function() {
        console.log("DOING ACTION", name);
        // Call debugger and show failures
        dbg[name]()
        .then(function(res) {
            return updateState();
        }, function(err) {
            showError(err);
        })
        .done();
    }
};

dbg.runner.on('update', function() {
    console.log('UPDATE');
})

var hookupControls = function(dbg) {
    CONTROLS.forEach(function(name) {
        return hookupControl(dbg, name);
    });
};

hookupControls(dbg);

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
    _.partial(dbg.break, '12'),
    function () { return dbg.run(); },
    dbg.list,
    log('source-out'),
    dbg.continue,
    dbg.locals,
    log('locals-out'),
    dbg.list,
    log('source-out'),
    //dbg.quit
].reduce(Q.when, dbg.init())
.done(function() {
    console.log('DONE');
});

}
