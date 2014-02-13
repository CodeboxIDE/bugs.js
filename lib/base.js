// Requires
var Q = require('q');
var _ = require('lodash');

var runner = require('./runner');


function BaseDB() {
    // Start runner
    this.runner = runner(
        this.proc,
        this.commands,
        {
            isPrompt: this.isPrompt,
            isError: this.isError,
        }
    );
}

// Child classes should override this
// to provide their own command mappings
// and argument/result parsing
BaseDB.prototype.commands = {};

/*
    Public methods
*/
BaseDB.prototype.break = function(location) {
    var cmd = 'breakpoint.line';
    var args = _.toArray(arguments);

    // Determin if we're breaking on a file
    if(args.length === 1 && _.isString(location)) {
        // Is it a line
        if(location.indexOf(':') !== -1) {
            cmd = 'breakpoint.line';
        } else {
            cmd = 'breakpoint.func';
        }
    } else if(args.length === 1 && _.isNumber(location)) {
        cmd = 'breakpoint.line';
    } else if(args.length === 2) {
        cmd = 'breakpoint.line';
        location = args.map(String).join(':');
    }

    return this.runner.cmd(cmd, location);
};

BaseDB.prototype.breakpoints = function() {
    return this.cmd('breakpoint.list');
};

BaseDB.prototype.isPrompt = function(line, buffer) {
    // Detect standard prompts due to the fact
    // they do not have EOL and end with spaces mostly

    return (
        line[line.length-1] === ' ' &&
        line.trim().length > 0 &&
        (buffer.slice(-2).indexOf('\n') !== -1 || !buffer)
    );
};

BaseDB.prototype.isError = _.constant(false);

// Exports
module.exports = BaseDB;
