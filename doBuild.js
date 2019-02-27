const fs = require('fs-extra');
const path = require('path');
const rmrf = require('rmrf-promise');
const { omit } = require('lodash');

const doCopy = require('./doCopy');

(async function() {
    // delete and create build folder
    const buildPath = 'build';
    await rmrf(buildPath);
    fs.ensureDirSync(buildPath);

    doCopy();

    // create a stripped-down package.json and put it in the build folder.
    const packageJSON = fs.readJsonSync('package.json');
    const newPackageJSON = omit(packageJSON, [
        'build',
        'devDependencies',
        'scripts'
    ]);
    fs.writeJsonSync(path.join(buildPath, 'package.json'), newPackageJSON);

})();
