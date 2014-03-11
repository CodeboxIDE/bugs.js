// Requires
var Q = require('q');
var _ = require('lodash');

var path = require('path');

var runner = require('./runner');

// Method builder for obvious commands
// (without arguments)
function doCmd(cmd, needsArgs) {
    return function() {
        return this.runner.cmd.apply(
            this.runner,
            [cmd].concat(needsArgs ? _.toArray(arguments) : [])
        );
    };
}

function isPath(str) {
    return (
        // Non empty strings
        str.length > 0 &&
      
        // Check that it starts like a path
        (str[0] === path.sep || str[0] === '.') &&
        
        // Check invalid chars
        str.indexOf('\n') === -1 &&
        str.indexOf('\t') === -1
    );
}

function BaseDB(stream) {
    // Bind methods
    _.bindAll(this);

    // Duplex stream of input/output data
    this.stream = stream;

    // Start runner
    this.runner = runner(
        this.stream,
        this.commands,
        {
            isPrompt: this.isPrompt,
            isError: this.isError,
            isResult: this.isResult,
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
BaseDB.prototype.run = doCmd('run', true);
BaseDB.prototype.quit = doCmd('quit');
BaseDB.prototype.restart = doCmd('restart');

// Movement
BaseDB.prototype.finish = doCmd('finish');
BaseDB.prototype.step = doCmd('step');
BaseDB.prototype.stepi = doCmd('stepi');
BaseDB.prototype.continue = doCmd('continue');
BaseDB.prototype.next = doCmd('next');
BaseDB.prototype.up = doCmd('up');
BaseDB.prototype.down = doCmd('down');

// Examine
BaseDB.prototype.eval = doCmd('eval', true);
BaseDB.prototype.backtrace = doCmd('backtrace');
BaseDB.prototype.list = doCmd('list');
BaseDB.prototype.locals = doCmd('locals');

// Breakpoints
BaseDB.prototype.break = function(location) {
    var cmd = 'breakpoint.line';
    var args = _.toArray(arguments).filter(Boolean);
    
    var intLocation = parseInt(location, 10);
    location = isNaN(intLocation) ? location : intLocation;

    // Determin if we're breaking on a file
    if(args.length === 1 && _.isString(location)) {
        // Is it a line
        if(location.indexOf(':') !== -1) {
            cmd = 'breakpoint.line';
        } else {
            cmd = 'breakpoint.func';
        }
    } else if(
        (args.length === 1 || args.length === 2) &&
        _.isNumber(location)
    ) {
        cmd = 'breakpoint.line';
    } else if(args.length === 2) {
        cmd = 'breakpoint.line';
        location = args.map(String).join(':');
    }

    return this.runner.cmd(cmd, location);
};
BaseDB.prototype.clear = doCmd('clear', true);
BaseDB.prototype.breakpoints = doCmd('breakpoint.list');

// Aliases
BaseDB.prototype.start = doCmd('run');
BaseDB.prototype.stop = doCmd('quit');

/*
    Lifetime management
*/
BaseDB.prototype.init = function() {
    return this.runner.init();
};

BaseDB.prototype.kill = function() {
    return this.runner.kill();
};

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
BaseDB.prototype.isResult = _.constant(true);

// Attach doCmd to BaseDB so children can use it
BaseDB.doCmd = doCmd;

// Exports
module.exports = BaseDB;
