// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');

// Does a group of two lines look like
// a pdb location
function isLocation(bilines) {
    return (
        bilines[0].indexOf('> ') === 0 &&
        bilines[1].indexOf('-> ') === 0
    );
}

// Find pairs of locations in a buffer
function findLocationsLines(buffer) {
    var lines = buffer.split(os.EOL);
    
    if(lines.length < 2) return [];
    
    // Bigrams of lines
    var bilines = _.zip(lines, lines.slice(1))
    
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
                
                console.log('BP Line =', JSON.stringify(line));
                console.log('BP PARTS =', parts);
                console.log('BP LENGTH =', parts.length);
                
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
        cmd: 'import json; print(json.dumps({k:v for k,v in locals().items() if type(v) in (int, str, bool, unicode, float)}, skipkeys=True))',
        result: JSON.parse
    },
};

PDB.prototype.isError = function(buffer) {
    var lines = buffer.split(os.EOL);
    var errorLine = _.first(_.filter(lines, Boolean));

    // Pdb signals an error by starting the first line with '***'
    return errorLine.indexOf('***') === 0;
};

// Exports
module.exports = PDB;
