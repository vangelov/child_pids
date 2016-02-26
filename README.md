# child_pids
Retrieve all pids for a process tree up to certain height.

## Installation
`npm install child_pids`

## Usage

```javascript
var childs_pids = require('child_pids'),
    parentPid = 56
    maxDepth = 0; // all children. if > 0 only children to that height of the process tree are returned

childs_pids.find(parentPid, maxDepth, function(err, pids) {
    console.log('Children pids', pids);
});

```
you will need to install eyespect to run the above example
`npm install eyespect`

### Test
To run the tests execute
`npm test`
