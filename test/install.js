var unify = require('../lib');

unify.commands.init({
    name: 'razor',
    client: ['app/fayde.json'],
    type: 'app'
}, function (err) {
    unify.commands.install({libs: ['exjs#*', 'fayde.controls'], options: {save: true}}, function (err) {
        if (err) {
            if (err.message)
                process.stderr.write(err.message + '\n');
            if (err.stack)
                process.stderr.write(err.stack + '\n');
        }
    });
});