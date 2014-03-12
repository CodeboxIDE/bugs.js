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
        return line.slice(1, -1).replace('\\t', '\t').replace('\\n', '\n');
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
        cmd: 'print',
        result: function(buffer) {
            var result = parseMI(buffer);
            return _.first(result.output.split('\n')).split(' = ')[1];
        }
    },
    'breakpoint.list': {
        cmd: 'info break',
        result: function(buffer) {
            var result = parseMI(buffer);
            return result.output.split('\n')
            .filter(function(line) {
                return !isNaN(parseInt(line.split(/\s+/)[0], 10));
            })
            .map(function(line) {
                var parts = line.split(/\s+/);
                // Split the location (filename:line)
                var lparts = parts[8].split(':');
                return {
                    num: parseInt(parts[0], 10),
                    location: {
                        filename: lparts[0],
                        line: parseInt(lparts[1], 10),
                        
                        addr: parts[4]
                    }
                }
            })
        }
    },
    'breakpoint.line': {
        cmd: 'break'
    },
    'breakpoint.func': {
        cmd: 'break'
    },
    'backtrace': {
        cmd: 'where',
        result: function(buffer) {
            var result = parseMI(buffer);
            return result.output.split('\n')
            .map(function(line) {
                var matches = line.match(/\#(\d+).*at (.*)\:(\d+)/);
                
                if(!matches) return;
                
                // Location object
                return {
                    filename: matches[2],
                    line: parseInt(matches[3], 10)
                };
            })
            .filter(Boolean);
        }
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
