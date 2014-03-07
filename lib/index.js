// Requires
var _ = require('lodash');

var pty = require('pty.js');
var es = require('event-stream');


// Binary mappings for debuggers
var BIN = {
    'gdb': 'gdb',
    'jdb': 'jdb',
    'rdb': 'ruby',
    'pdb': 'python',
};

// List of arguments for debugger (filename will be appended)
var ARGS = {
    'pdb': ['-m', 'pdb'],
    'rdb': ['-rdebug'],
    'gdb': ['-q', '--interpreter=mi'],
    'jdb': [],
};


function createGen(name) {
    var parserClass = require('./'+name);
    return function(filename, options) {
        // Default options
        options = _.defaults(options || {}, {
            directory: process.cwd()
        });

        // Spawn pty.js process
        var proc = pty.spawn(
            BIN[name],
            ARGS[name].concat([filename]),
            {
                cwd: options.directory
            }
        );
        var stream = es.duplex(
            // Write
            proc.stdin,

            // Read
            proc.stdout
        );
        return new parserClass(stream);
    };
}

module.exports = {
    // Interfaces for users
    'pdb': createGen('pdb'),
    'gdb': createGen('gdb'),
    'jdb': createGen('jdb'),
    'rdb': createGen('rdb'),

    // Stream parser classes
    'PDB': require('./pdb'),
    'GDB': require('./gdb'),
    'JDB': require('./jdb'),
    'RDB': require('./rdb'),
};
