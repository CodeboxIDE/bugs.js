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
BaseDB.prototype.break = function() {
    var cmd = 'breakpoint.create';
    var args = _.toArray(arguments);

    // Determin if we're breaking on a file
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
