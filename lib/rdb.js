// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');


function RDB(filename, options) {
    if(this instanceof RDB === false) {
        return new RDB(filename, options);
    }

    options = options || {};

    this.proc = pty.spawn(
        'ruby',
        [
            '-rdebug',

            filename
        ],
        {
            cwd: options.directory
        }
    );

    RDB.super_.call(this);
}
inherits(RDB, require('./base'));

RDB.prototype.commands = {
    'eval': {
        cmd: 'p'
    },
    'breakpoint.list': {
        cmd: 'break'
    },
    'breakpoint.line': {
        cmd: 'break'
    },
    'breakpoint.func': {
        cmd: 'break'
    },
    'backtrace': {
        cmd: 'where'
    },
    'locals': {
        // Hackish dump of values to JSON ...
        cmd: 'var local'
    },
};

// Exports
module.exports = RDB;
