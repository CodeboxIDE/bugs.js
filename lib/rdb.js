// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');


function parseLocation(line) {
    var parts = line.split(':', 3);
    var lineno = parseInt(parts[1], 10);

    // Ensure validity
    if(
        parts.length < 3 ||
        isNaN(lineno)
    ) return null;

    // Return location object
    return {
        filename: parts[0],
        line: lineno,
        src: parts[2],
    };
}

function isLocation(line) {
    return parseLocation(line) !== null;
}

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
    'continue': {
        cmd: 'cont'
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
        cmd: 'var local',
        result: function(data) {
            var lines = data.split(os.EOF);
            return _.objet(_.map(lines, function(line) {
                return line.trimLeft().split(' => ', 2);
            }));
        }
    },
};

// Exports
module.exports = RDB;
