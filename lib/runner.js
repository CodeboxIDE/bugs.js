// Requires
var Q = require('q');
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var es = require('event-stream');


// Runs a set of commands on a debugger process
function Runner(proc, cmds, options) {
    // So constructor can be called as a function too
    if(this instanceof Runner === false) {
        return new Runner(proc, cmds, options);
    }

    // Bind methods to instance
    _.bindAll(this);

    // The debugger process
    this.proc = proc;

    // The map of commands this supports
    this.cmds = cmds;

    // A queue of commands
    this.queue = [];

    // Options
    this.options = _.extend({
        /*
        // Synchronous function to tell if the current line
        // is the prompt or not
        isPrompt: function(line) {
            return line.indexOf('(gdb)') === 0;
        },
        // Is the current response buffer an erro
        isError: function(buffer) {
            return false;
        }
        */
    }, options || {});

    // Result buffer
    this.buffer = '';
    this.previousLine = '';

    // Are we currently typing at the prompt
    this.prompted = false;

    // Data stream of lines from the debuggers stdout
    this.stream = es.duplex(
        // Write
        this.proc.stdin,

        // Read
        es.pipeline(
            this.proc.stdout
        )
    );

    // Normalize input data
    this.stream.on('data', function(data) {
        data.toString().split(os.EOL).map(function(s) {
            return s.replace('\r', os.EOL) || os.EOL;
        }).forEach(this.onLine);
    }.bind(this));
}
inherits(Runner, EventEmitter);

// Get a new line from the output
Runner.prototype.onLine = function(line) {
    // Looks like a prompt
    // and we're currently not prompted
    var isPrompt = (
        this.options.isPrompt(line, this.buffer) &&
        this.prompted === false
    );
    var hasNewline = line.indexOf(os.EOL) !== -1;

    // Don't append to buffers when prompt is active
    if(this.prompted) {
        // Deactivate prompt on newline
        if(hasNewline) {
            this.prompted = false;
        }
        return;
    }

    // If not prompt append data and exit
    if(!isPrompt) {
        // Add to buffer and line
        this.buffer += line;
        this.previousLine += line;

        // Clear previous line
        if(hasNewline) {
            this.previousLine = '';
        }

        //process.stderr.write('\nX> '+JSON.stringify(line)+'\n');
        return;
    }

    // We're now on a prompt
    this.prompted = true;

    //*
    console.log();
    console.log('previousLine =', JSON.stringify(this.previousLine));
    console.log('buffer =', JSON.stringify(this.buffer));
    console.log('currentLine =', JSON.stringify(line));
    console.log();
    /**/

    // Keep a copy for our success & error resolution
    var buffer = this.buffer;

    // Clear buffers
    this.buffer = '';
    this.previousLine = '';

    // Is buffer empty ?
    // if so probably nothing happened
    if(_.isEmpty(buffer.trim())) {
        console.log('EMPTY');
        return;
    }

    if(this.options.isError(buffer)) {
        console.log('ERROR');
    } else {
        console.log('SUCCESS');
    }

    // Nothing to resolve
    if(_.isEmpty(this.queue)) return;

    if(this.options.isError(buffer)) {
        console.log('ERROR');
        return this.reject(new Error(buffer));
    }

    return this.resolve(buffer);
};

Runner.prototype.parseResult = function(cmd, buffer) {
    return buffer;
};

Runner.prototype.raw = function(rawCmd, cmd) {
    // This will be resolved when the command has finished executing
    var d = Q.defer();

    // Default the verbose command name if not provided
    // to rawCmd
    cmd = cmd || rawCmd.split(' ')[0];

    // Push it
    this.queue.unshift([d, cmd]);

    // The command's promise
    return d.promise;
};

Runner.prototype.cmd = function(cmd, arg) {
    // Map command if mapping exists
    var rawCmd = this.cmds[cmd] ? this.cmds[cmd].cmd : cmd;

    // Run raw command
    return this.raw([rawCmd, arg].join(' '), cmd)
    .then(_.partial(this.parseResult, cmd));
};

// Fail the command and the head of the queue
Runner.prototype.reject = function(err) {
    var x = this.queue.pop();
    var deffered = x[0], cmd = x[1];

    // Fail the promise
    deffered.reject(err);

    // Emit command failure
    this.emit('reject', {
        cmd: cmd,
        error: err
    });

    return d;
};

Runner.prototype.resolve = function(value) {
    var x = this.queue.pop();
    var deffered = x[0], cmd = x[1];

    // Resolve the promise
    deffered.resolve(value);

    // Emit command success
    this.emit('resolve', {
        cmd: cmd,
        value: value
    });

    return d;
};

Runner.prototype.cleanup = function() {
    // Error to fail promises with
    var err = new Error('Runner is cleaning up');

    // Fail all the promises in the current command queue
    _.range(this.queue.length).each(_.partial(this.reject, err));
};

// Exports
module.exports = Runner;
