// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');


function JDB(filename, options) {
    if(this instanceof JDB === false) {
        return new JDB(filename, options);
    }

    options = options || {};

    this.proc = pty.spawn(
        'jdb',
        [
            filename
        ],
        {
            cwd: options.directory
        }
    );

    JDB.super_.call(this);
}
inherits(JDB, require('./base'));

JDB.prototype.commands = {
    'eval': {
        cmd: 'print'
    },
    'finish': {
        cmd: 'step up'
    },
    'breakpoint.list': {
        cmd: 'clear'
    },
    'breakpoint.line': {
        cmd: 'stop at'
    },
    'breakpoint.func': {
        cmd: 'stop in'
    },
    'backtrace': {
        cmd: 'where'
    },
    'continue': {
        cmd: 'cont'
    },
};

JDB.prototype.isError = function(buffer) {
    var lines = buffer.split(os.EOL);
    var errorLine = _.first(_.filter(lines, Boolean));

    console.log('errorLine =', errorLine);

    // Check for some common JVM failures
    return _.any([
        // Vm not started
        /Command '\w+' is not valid until the VM is started/,
        // Bad arguments
        /^Usage\:/,
        // Bad command
        /^Unrecognized command:/
    ].map(function(r) {
        return r.test(errorLine);
    }));
};

// Exports
module.exports = JDB;
