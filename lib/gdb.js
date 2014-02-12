// Requires
var _ = require('lodash');

var inherits = require('util').inherits;

var pty = require('pty.js');


function GDB(filename, options) {
    if(this instanceof GDB === false) {
        return new GDB(filename, options);
    }

    options = options || {};

    this.proc = pty.spawn(
        'gdb',
        [
            '-q',
            '--interpreter=mi',

            filename
        ],
        {
            cwd: options.directory
        }
    );

    GDB.super_.call(this);
}
inherits(GDB, require('./base'));

GDB.prototype.isPrompt = function(line) {
    return line === '(gdb) \n';
};

GDB.prototype.isError = function(buffer) {
    var lines = buffer.split();
    var statusLine = _.last(lines);

    console.log('status =', statusLine);

    switch(statusLine[0]) {
        case '*':
            return false;
        case '^':
            return statusLine.slice(1, statusLine.indexOf(',')) === 'error';
        default:
            break;
    }

    return false;
};

// Exports
module.exports = GDB;
