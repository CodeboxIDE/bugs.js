// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;


function parseBreakpointAdd(line) {
    var matches = line.match(/Breakpoint (\d+) at (.*)\:(\d+)/);
    
    // Construct breakpoint object
    return {
        num: matches[1],
        locaton: {
            filename: matches[2],
            line: parseInt(matches[3])
        }
    }
}

function parseBreakpointClear(line) {
    // See if we were deleting a breakpoint that didn't exist
    return line.indexOf('No breakpoint') !== 0;
}

// Does a group of two lines look like
// a pdb location
function isLocation(bilines) {
    return (
        bilines[1].indexOf('-> ') === 0
    );
}

// Find pairs of locations in a buffer
function findLocationsLines(buffer) {
    // Split lines and ignore empty ones
    var lines = buffer.split(os.EOL).filter(Boolean);
    
    if(lines.length < 2) return [];
    
    // Bigrams of lines
    var bilines = _.zip(lines, lines.slice(1)).slice(0, -1);
    
    // Filter out uninteresting groups
    return bilines.filter(isLocation);
}

function hasLocations(buffer) {
    return findLocationsLines(buffer).length === 0;
}


function PDB(stream) {
    if(this instanceof PDB === false) {
        return new PDB(stream);
    }

    PDB.super_.call(this, stream);
}
inherits(PDB, require('./base'));

PDB.prototype.commands = {
    'run': {
        cmd: 'continue',
    },
    'eval': {
        cmd: 'print'
    },
    'finish': {
        cmd: 'return'
    },
    'breakpoint.list': {
        cmd: 'break',
        result: function(buffer) {
            var lines = buffer.split(os.EOL);
            
            // Is line a breakpoint
            var isBPLine = function(line) {
                return (
                    !isNaN(parseInt(line.split('\t')[0], 10)) &&
                    line.split(/\s+/).length === 6
                );
            }
            
            // Parses a line to a breakpoint
            var BPLine = function(line) {
                /* Sample output
                 *
                Num Type         Disp Enb   Where                    
                1   breakpoint   keep yes   at /Users/aaron/git/bugs/test/hello.py:1
                */
                // Split by whitespace
                var parts = line.split(/\s+/);
                
                // Get location portion as parts [filename, line]
                var lparts = parts[5].split(':');
                
                return {
                    num: parts[0],
                    location: {
                        filename: lparts[0],
                        line: parseInt(lparts[1])
                    }
                };
            };
            
            return lines
            .filter(isBPLine)
            .map(BPLine);
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
        cmd: 'clear',
        result: parseBreakpointClear
    },
    'backtrace': {
        cmd: 'where',
        result: function(buffer) {
            var bilines = findLocationsLines(buffer);
            return bilines.map(function(lines) {
                var lparts = lines[0].split(/\s+/)[1].match(/(.*)\((\d+)\)(.*)/);
                var src = lines[1].split(/\s+/)[1];
                
                return {
                    filename: lparts[1],
                    line: lparts[2],
                    method: lparts[3],
                    
                    src: src
                };
            });
        }
    },
    'locals': {
        // Hackish dump of values to JSON ...
        cmd: 'import json; print(json.dumps({k:v for k,v in locals().items() if type(v) in (int, str, bool, unicode, float)}, skipkeys=True))',
        result: JSON.parse
    },
};

PDB.prototype.isError = function(buffer) {
    var lines = buffer.split(os.EOL);
    var errorLine = _.first(_.filter(lines, Boolean));

    // Pdb signals an error by starting the first line with '***'
    return errorLine && errorLine.indexOf('***') === 0;
};

// Exports
module.exports = PDB;
