var bugs = require('../');

if(!process.argv[2]) {
    console.log('Please specify a python file to debug');
    process.exit();
}

// Use pdb to debug a python file
// the file is supplied via a command line arg
var dbg = bugs.pdb(process.argv[2]);

// Debug "main" function
dbg.break('main')
.then(function() {
    // Run debugger
    return dbg.run();
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
.done(function(err) {
    console.log('DONE ERR =', err);
});
