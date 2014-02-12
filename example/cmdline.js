var through = require('event-stream').through;

var bugs = require('../');

var lang = 'jdb';

var buger = bugs[lang](process.argv[2]);

var run = buger.runner;

var state = { meta: false };
var keyboard = through(function (buf) {
    if (buf.length === 1 && buf[0] === 1) {
        state.meta = true;
        return;
    }

    if (state.meta && buf[0] === 'd'.charCodeAt(0)) {
        process.exit();
    }
    else this.queue(buf);
    state.meta = false;
});

keyboard.pipe(run.stream).pipe(process.stdout);

process.stdin.setRawMode(true);
process.stdin.pipe(keyboard);

run.stream.on('end', function() {
    console.log('ENDED');
    process.exit();
});

process.on('exit', function () {
    process.stdin.setRawMode(false);
    console.log();
    process.exit();
});
