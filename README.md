bugs
====

A NodeJS library providing a unified interface to common debuggers (gdb, jdb, pdb, ...)

## Supported debuggers
  - `gdb` : C/C++ (and any native binaries really)
  - `jvm` : Java (and anything running on the JVM)
  - `pdb` : Python
  - Feel free to send Pull Requests for more

Right now we interface with the current debugger through their command line programs and smartly writing and reading from their `stdout`/`stdin`.



# Commands

## General

### .run(arg1, arg2, ...)
Run file to debug with given args

### .quit()
Quit current instance of the debugger (this isn't terribly useful)


## Movement

### .finish()
Run until current method returns.

### .step()
Execute and step into function

### .stepi()
Execute current instruction

### .continue()
Keep running from here

### .next()
Run to the next line of the current function


## Examination

### .eval(code)
Evaluate a string of `code` and print the result


## Breakpoints

### .breakpoints()
Lists currently set breakpoints

### .breakpoint(location)
Set a new breakpoint at `location` (`location` can be a line number, function address ...)
