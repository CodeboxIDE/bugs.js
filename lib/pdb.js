// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');


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
