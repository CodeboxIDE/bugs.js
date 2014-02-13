// Requires
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;

var pty = require('pty.js');


function PDB(filename, options) {
    if(this instanceof PDB === false) {
        return new PDB(filename, options);
    }

    options = options || {};

    this.proc = pty.spawn(
        'python',
        [
            '-m', 'pdb',

            filename
        ],
        {
            cwd: options.directory
        }
    );

    PDB.super_.call(this);
}
inherits(PDB, require('./base'));

PDB.prototype.commands = {
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
        cmd: 'import json; json.dumps({k:v for k,v in locals().items() if type(v) in (int, str, bool, unicode, float)}, skipkeys=True)'
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
