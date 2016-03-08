var child_pids = require('../index'),
    chai = require('chai'),
    proxyquire = require('proxyquire');
    expect = chai.expect;

describe('child_pids', function() {
    var pids, parentPidMap;

    beforeEach(function() {
        pids = [1, 43, 44, 56];

        parentPidMap = {
            '1': 0,
            '43': 1,
            '44': 1,
            '56': 44
        };
    })

    it('returns an error if the process id cannot be found', function(done) {
        var childPids = proxyquire('../index', {
            'is-running': function() {
                return false;
            }
        });

        childPids.find(123, 0, function(err, pids) {
            expect(err).to.be.ok;
            done();
        });
    })

    it('parses ps command output', function() {
        var output = 'PID  PPID\n  1   0\n43   1\n44   1\n56   44',
            testParentPidMap = {},
            testPids = [];

        child_pids._parsePsOutput(output, testPids, testParentPidMap);
        expect(testPids).to.have.members(pids);

        var parents = testPids.map(function(pid) {
            return testParentPidMap[pid];
        });

        expect(parents).to.eql(Object.keys(parentPidMap).map(function(key) {
            return parentPidMap[key];
        }));
    });

    describe('isChild', function() {
        it('checks children on all levels for maxDepth <= 0', function() {
            expect(child_pids._isChild(1, 0, 0, parentPidMap)).to.be.true;
            expect(child_pids._isChild(43, 0, 0, parentPidMap)).to.be.true;
            expect(child_pids._isChild(56, 0, 0, parentPidMap)).to.be.true;
        })

        it('checks to a certain when maxDepth > 0', function() {
            expect(child_pids._isChild(1, 0, 1, parentPidMap)).to.be.true;
            expect(child_pids._isChild(43, 0, 1, parentPidMap)).to.be.false;
            expect(child_pids._isChild(56, 1, 2, parentPidMap)).to.be.true;
            expect(child_pids._isChild(56, 1, 1, parentPidMap)).to.be.false;
        })

        it('fails when there is no common parent', function() {
            expect(child_pids._isChild(43, 44, 0, parentPidMap)).to.be.false;
            expect(child_pids._isChild(56, 43, 0, parentPidMap)).to.be.false;
        });
    })
});
