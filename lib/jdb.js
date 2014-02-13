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
};

// Exports
module.exports = JDB;
