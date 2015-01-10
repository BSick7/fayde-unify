function Update(unify) {
    this.unify = unify;
}
Update.prototype.interactive = function (args) {
    var argv = optimist
        .boolean(['un'])
        .parse(args || "");
    return this.run({
        libs: argv._,
        options: {
            un: argv['un']
        }
    });
};
Update.prototype.run = function (settings) {
    settings.options = settings.options || {};
    return Promise.resolve(this)
        .tap(function (ec) {
            return ec.unify.load();
        })
        .tap(function (ec) {

        });
};


module.exports = Update;