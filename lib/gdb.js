// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');


// What the start of MI lines mean
var miMap = {
    '~': 'output',
    '&': 'command',
    '*': 'process',
    '=': 'event',
    '^': 'status'
};

function parseMILine(line) {
    // Remove control char
    line = line.slice(1);

    // Remove wrapping quotes if existant
    if(line[0] === line[line.length-1] === '"') {
        return line.slice(1, -1);
    }

    return line;
}

// Parse GDB Machine Interface outputs
function parseMI(buffer) {
    return _(buffer.split('\n'))
    .reduce(
        function(line, parsed) {
            var lineType = miMap[line[0]] || 'other';

            if(parsed[lineType] === undefined) {
                parsed[lineType] = [];
            }

            parsed[lineType].push(parseMILine(line));

            return parsed;
        },
        {}
    )
    .map(function(value, key) {
        // Remerge strings
        return [key, value.join('\n')];
    }).object().value();
}


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

GDB.prototype.commands = {
    'eval': {
        cmd: 'print'
    },
    'breakpoint.list': {
        cmd: 'info break'
    },
    'breakpoint.line': {
        cmd: 'break'
    },
    'breakpoint.func': {
        cmd: 'break'
    },
    'locals': {
        cmd: 'info locals'
    }
};


GDB.prototype.isPrompt = function(line) {
    return line === '(gdb) \n';
};

GDB.prototype.isError = function(buffer) {
    var lines = _.filter(buffer.split(os.EOL), Boolean);
    var statusLine = _.last(lines);

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
