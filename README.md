bugs.js
====

A *NodeJS* library providing a unified interface to common debuggers (`gdb`, `jdb`, `pdb`, ...). It's meant for building developer tools (debug tools, IDEs, etc ...), built for [Codebox](https://github.com/FriendCode/codebox)

## Supported debuggers
  - `gdb` : `c/c++` (and any native binaries really)
  - `jdb` : `java` (and anything running on the JVM)
  - `pdb` : `python`
  - `rdb` : `ruby`
  - Feel free to send Pull Requests for more

Right now we interface with the current debugger through their command line programs and smartly writing and reading from their `stdout`/`stdin`.

## Install
:warning: *Warning*: `bugs` is not yet published to npm
```
npm install bugs
```

## Examples

#### `python` with `pdb`

```js
var bugs = require('bugs');

// Use pdb to debug a python file
var dbg = bugs.pdb('./some_file.py');

// Debug "main" function
dbg.init()
.then(function() {
    return dbg.break('main');
})
.then(function() {
    // Run debugger
    return dbg.run();
})
.then(function() {
    // Get backtrace
    return dbg.backtrace();
})
.then(function(trace) {
    // Display trace & quit
    console.log('trace =', trace)
    return dbg.quit();
})
.done();
```

#### Native binaries with `gdb`

```js
var bugs = require('bugs');

// Use gdb to unix "ls" binary
var dbg = bugs.gdb('ls');

// Debug "main" function
dbg.init()
.then(function() {
    return dbg.break('main');
})
.then(function() {
    // Run "ls" on a given folder
    return dbg.run('-al /tmp');
})
.then(function() {
    // Get backtrace
    return dbg.backtrace();
})
.then(function(trace) {
    // Display trace & quit
    console.log('trace =', trace)
    return dbg.quit();
})
.done();
```

# Commands

## General

### `.run(arg1, arg2, ...)`
Run file to debug with given args

### `.restart()`
Restart program

### `.quit()`
Quit current instance of the debugger (this isn't terribly useful)


## Movement

### `.finish()`
Run until current method returns.

### `.step()`
Execute and step into function

### `.stepi()`
Execute current instruction

### `.continue()`
Keep running from here

### `.next()`
Run to the next line of the current function

### `.up()`
Move one level up in the stack trace

### `.down()`
Move one level down in the stack trace


## Examination

### `.eval(code)`
Evaluate a string of `code` and print the result

### `.backtrace()`
Print backtrace of current stack

### `.list()`
List source code of current location

### `.locals()`
Get local variables of current stack

### `.globals()`
Get global variables


## Breakpoints

### `.breakpoints()`
Lists currently set breakpoints

### `.breakpoint(location)`
Set a new breakpoint at `location` (`location` can be a line number, function address ...)

### `.clear(location)`
Clear breakproint for `location` (see above for `location`)

## Aliases

### `.start()`
Alias to `run`

### `.stop()`
Alias to `quit`

# Events

### `started`
Signals when the debugger is ready to receive commands.
`.init()` resolves when `started` is emitted (you should probably use that).

### `update`
Provides updates when state of process changes. And updates not request or results of commands executed.

