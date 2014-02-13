// Requires
var Q = require('q');
var _ = require('lodash');

var runner = require('./runner');

// Method builder for obvious commands
// (without arguments)
function doCmd(cmd) {
    return function() {
        return this.runner.cmd.apply(
            this.runner,
            [cmd].concat(_.toArray(arguments))
        );
    };
}

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

// General
BaseDB.prototype.run = doCmd('run');
BaseDB.prototype.quit = doCmd('quit');

// Movement
BaseDB.prototype.finish = doCmd('finish');
BaseDB.prototype.step = doCmd('step');
BaseDB.prototype.stepi = doCmd('stepi');
BaseDB.prototype.continue = doCmd('continue');
BaseDB.prototype.next = doCmd('next');
BaseDB.prototype.up = doCmd('up');

// Examine
BaseDB.prototype.eval = doCmd('eval');
BaseDB.prototype.backtrace = doCmd('backtrace');
BaseDB.prototype.list = doCmd('list');

// Breakpoints
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
BaseDB.prototype.clear = doCmd('clear');
BaseDB.prototype.breakpoints = doCmd('breakpoint.list');

/*
    Lifetime management
*/


/*
    Utility methods used by runner
*/
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
