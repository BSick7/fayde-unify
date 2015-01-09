var Promise = require('bluebird'),
    async = require('async');

function series(tasks) {
    return new Promise(function (resolve, reject) {
        async.series(tasks.map(function (task) {
            return function (callback) {
                var promise = task();
                promise.then(function (res) {
                    callback(null, res);
                }, callback);
            }
        }), function (err, results) {
            if (err)
                reject(err);
            else
                resolve(results);
        })
    });
}

module.exports = {
    series: series
};