// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;


function parseBreakpointAdd(line) {
    var matches = line.trim().match(/^Set breakpoint (\d+) at (.*)\:(\d+)$/);
    
    if(!matches) return null;
    
    // Construct breakpoint object
    return {
        num: matches[1],
        locaton: {
            filename: matches[2],
            line: parseInt(matches[3])
        }
    }
}

function parseBreakpointClear(line){
    return (
        line.length === 0 &&
        line.indexOf('is not defined') === -1
    );
}

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

function RDB(stream) {
    if(this instanceof RDB === false) {
        return new RDB(stream);
    }

    RDB.super_.call(this, stream);
}
inherits(RDB, require('./base'));

RDB.prototype._isStacktrace = function(buffer) {
    var lines = buffer.split('\n');

    // All lines in a stack trace are location lines
    if(!_.all(_.map(lines, isLocation))) return false;

    // All lines except first start with "\tfrom"
    return _.all(_.rest(lines), function(line) {
        return line.indexOf('\tfrom') === 0;
    });
};

RDB.prototype.isError = function(buffer) {
    return this._isStacktrace(buffer);
};

RDB.prototype.commands = {
    'run': {
        cmd: 'cont'  
    },
    'eval': {
        cmd: 'p'
    },
    'continue': {
        cmd: 'cont'
    },
    'breakpoint.list': {
        cmd: 'break',
        result: function(buffer) {
            var lines = buffer.split(os.EOL).filter(Boolean);
            
            // No breakpoints
            if(lines.length < 2) {
                return [];
            }
            
            var bplines = _.rest(lines);
            return bplines.map(function(line) {
                //console.log('line =', JSON.stringify(line));
                var matches = line.match(/  (\d+) (.*)\:(\d+)/);

                if(!matches) return;

                return {
                    num: parseInt(matches[1]),
                    
                    location: {
                        filename: matches[2],
                        line: parseInt(matches[3])
                    }
                }
            });
        }
    },
    'breakpoint.line': {
        cmd: 'break',
        result: parseBreakpointAdd
    },
    'breakpoint.func': {
        cmd: 'break',
        result: parseBreakpointAdd
    },
    'clear': {
        cmd: 'delete',
        result: parseBreakpointClear
    },
    'backtrace': {
        cmd: 'where'
    },
    'locals': {
        // Hackish dump of values to JSON ...
        cmd: 'var local',
        result: function(data) {
            var lines = data.split(os.EOF);
            return _.object(_.map(lines, function(line) {
                return line.trimLeft().split(' => ', 2);
            }));
        }
    },
};

// Exports
module.exports = RDB;
