// Requires
var bugs = require('../');

// Use gdb to debug the unix "ls" binary
var dbg = bugs.gdb('ls');

// Debug "main" function
dbg.init()
.then(function() {
    return dbg.break('main');
})
.then(function() {
    // Run "ls" on a given folder
    return dbg.run('-al /tmp');
})
.then(function() {
    // Get backtrace
    return dbg.backtrace();
})
.then(function(trace) {
    // Display trace & quit
    console.log('trace =', trace);
    return dbg.quit();
})
.done();
