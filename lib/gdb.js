// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;


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
    // And remove newlines
    line = line.slice(1).replace('\\n', '');

    // Remove wrapping quotes if existant
    if(line[0] === line[line.length-1] && line[0] === '"') {
        return line.slice(1, -1);
    }

    return line;
}

// Parse GDB Machine Interface outputs
function parseMI(buffer) {
    return _.chain(buffer.split('\n'))
    .reduce(
        function(parsed, line) {
            var lineType = miMap[line[0]] || 'other';

            if(parsed[lineType] === undefined) {
                parsed[lineType] = [];
            }

            parsed[lineType].push(parseMILine(line));

            return parsed;
        },
        {}
    )
    .transform(function(result, value, key) {
        if(key === 'status') {
            value = [value[0].split(',')[0]];
        }
        // Remerge strings
        result[key] = value.join('\n');
    }).value();
}


function GDB(stream) {
    if(this instanceof GDB === false) {
        return new GDB(stream);
    }

    GDB.super_.call(this, stream);
}
inherits(GDB, require('./base'));

GDB.prototype.commands = {
    'restart': {
        cmd: 'run',
    },
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
        cmd: 'info locals',
        result: function(buffer) {
            var result = parseMI(buffer);
            return result.output.split('\n')
            .filter(function(line) {
                return line.trim();
            })
            .reduce(function(vars, line) {
                var parts = line.split(' = ');
                vars[parts[0]] = parts[1];
                return vars;
            }, {});
        }
    }
};


GDB.prototype.isPrompt = function(line) {
    return line === '(gdb) \n';
};

GDB.prototype.isError = function(buffer) {
    var status = parseMI(buffer).status;
    return status === 'error';
};

GDB.prototype.isResult = function(buffer) {
    return Boolean(parseMI(buffer).status);
};

// Exports
module.exports = GDB;
