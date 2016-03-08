
var childProcess = require('child_process'),
    isRunning = require('is-running');

function find(parentPid, maxDepth, callback) {
    if(!isRunning(parentPid)) {
        return process.nextTick(callback.bind(null, new Error('The parent pid could not be found.'), null));
    }

    loadPsInfo(function(err, pids, parentPidMap) {
        if(err) {
            return callback(err);
        }

        var childPids = pids.filter(function(pid) {
            return isChild(pid, parentPid, maxDepth, parentPidMap);
        });

        callback(null, childPids);
    });
}

function loadPsInfo(callback) {
    childProcess.exec('ps -A -o pid,ppid', function(err, data) {
        if(err) {
            return callback(err);
        }

        var parentPidMap = [];
        var pids = [];
        parsePsOutput(data, pids, parentPidMap);

        callback(null, pids, parentPidMap);
    });
}

function parsePsOutput(data, pids, parentPidMap) {
    var lines = data.split('\n').slice(1);

    lines.forEach(function(line) {
        var pair = line.trim().split(/\s+/),
            pid = Number(pair[0]),
            parentPid = Number(pair[1]);

        parentPidMap[pid] = parentPid;
        pids.push(pid);
    });
}

function isChild(pid, parentPid, maxDepth, parentPidMap) {
    var nextParentPid = parentPidMap[pid],
        depth = 1,
        finalMaxDepth = maxDepth > 0 ?
                            maxDepth :
                            Number.POSITIVE_INFINITY;

    while(nextParentPid != undefined && depth <= finalMaxDepth) {
        if(nextParentPid == parentPid) {
            return true;
        }

        nextParentPid = parentPidMap[nextParentPid];
        depth++;
    }

    return false;
}

exports.find = find;
exports._loadPsInfo = loadPsInfo;
exports._parsePsOutput = parsePsOutput;
exports._isChild = isChild;



