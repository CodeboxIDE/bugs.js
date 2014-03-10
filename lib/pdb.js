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
