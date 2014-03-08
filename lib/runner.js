// Requires
var Q = require('q');
var _ = require('lodash');

var os = require('os');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;


// Runs a set of commands on a debugger process
function Runner(stream, cmds, options) {
    // So constructor can be called as a function too
    if(this instanceof Runner === false) {
        return new Runner(stream, cmds, options);
    }

    // Bind methods to instance
    _.bindAll(this);

    // Data stream of lines to and from the debugger
    this.stream = stream;

    // The map of commands this supports
    this.cmds = cmds;

    // A queue of commands
    this.queue = [];
    
    // Current promise of active command
    this._current_promise = null;

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

    // This will be true when we have encountered our first prompt
    this.started = false;

    // Normalize input data
    this.stream.on('data', function(data) {
        data.toString().split(os.EOL).map(function(s) {
            return s.replace('\r', os.EOL) || os.EOL;
        }).forEach(this.onLine);
    }.bind(this));
}
inherits(Runner, EventEmitter);

Runner.prototype.emit = function(name, value) {
    console.log('[emit]', name, '=', value);
    return Runner.super_.prototype.emit.apply(this, arguments);
};

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

    // On first prompt
    if(!this.started) {
        this.emit('started');
        this.started = true;
    }

    // Keep a copy for our success & error resolution
    var buffer = this.buffer;

    // Clear buffers
    this.buffer = '';
    this.previousLine = '';

    // Is buffer empty ?
    // if so probably nothing happened
    if(_.isEmpty(buffer.trim())) {
        return;
    }

    // Nothing to resolve
    if(_.isEmpty(this.queue)) return;

    if(this.options.isError(buffer)) {
        return this.reject(new Error(buffer));
    } else if(!this.options.isResult(buffer)) {
        // Notify that something happened
        // but that it was not an expected result
        this.emit('update', buffer);
        return;
    }

    return this.resolve(buffer);
};

// Ensure Runner is up and running
Runner.prototype.init = function() {
    // Already started
    if(this.started) return Q();

    var d = Q.defer();

    // Resolve whenever we get the signal
    this.once('started', d.resolve);

    return d.promise;
};

Runner.prototype.parseResult = function(cmd, buffer) {
    return (
        this.cmds[cmd] && this.cmds[cmd].result ?
        this.cmds[cmd].result :
        _.identity
    )(buffer);
};

Runner.prototype.nextCmd = function() {
    // Command queue empty, nothing to do
    if(_.isEmpty(this.queue)) {
        return false;
    }
    
    // Head of our queue (cmd to run or current running)
    var x = _.last(this.queue);
    var deffered = x[0], cmd = x[1], rawCmd = x[3];

    // Current command still running, abort
    if(this._current_promise === deffered.promise) {
        return false;
    }
    
    // Execute command
    this.stream.write(rawCmd+'\n');
    
    // Set current promise
    this._current_promise = deffered.promise;
    
    return true;
}

Runner.prototype.raw = function(rawCmd, cmd) {
    // This will be resolved when the command has finished executing
    var d = Q.defer();

    // Default the verbose command name if not provided
    // to rawCmd
    cmd = cmd || rawCmd.split(' ')[0];

    // Push it
    this.queue.unshift([d, cmd, rawCmd]);

    // Run next command (or wait till current command is finished)
    this.nextCmd();

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
    var deffered = x[0], cmd = x[1], rawCmd = x[2];

    // Fail the promise
    deffered.reject(err);

    // Emit command failure
    this.emit('reject', {
        cmd: cmd,
        rawCmd: rawCmd,
        error: err
    });

    return deffered.promise;
};

Runner.prototype.resolve = function(value) {
    var x = this.queue.pop();
    var deffered = x[0], cmd = x[1], rawCmd = x[2];

    // Resolve the promise
    deffered.resolve(value);

    // Emit command success
    this.emit('resolve', {
        cmd: cmd,
        rawCmd: rawCmd,
        value: value
    });

    return deffered.promise;
};

Runner.prototype.cleanup = function() {
    // Error to fail promises with
    var err = new Error('Runner is cleaning up');

    // Fail all the promises in the current command queue
    _.range(this.queue.length).each(_.partial(this.reject, err));
};

// Exports
module.exports = Runner;
