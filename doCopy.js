const fs = require('fs-extra');
const path = require('path');

const doCopy = async () => {
    // I believe the file copying below could be run asynchronously, but I use await to make sure that when this code finishes,
    //  everything is truly copied.  That way we know everything is ready to go for the next step in the build script.

    const copyFolderIntoBuild = async function(sourceFolder, destFolder) {
        const publicFiles = fs.readdirSync(sourceFolder);
        for (const file of publicFiles) {
            fs.copySync(path.join(sourceFolder, file), path.join(destFolder, file));
        }
    };

    // copy public folder into build folder
    const buildPath = 'build';
    await copyFolderIntoBuild('public', buildPath);
    await copyFolderIntoBuild('locales', path.join(buildPath, 'locales'));

    // NOTE: we do not copy the src folder b/c our build script runs babel against it, and puts the output in the build folder.

    //await fs.copyAsync('.env', path.join(buildPath, '.env'));

};

module['exports'] = doCopy;
