const colors = require('colors/safe');
const rmrf = require('rmrf-promise');

(async function() {
    try {
        console.log(colors.white('\n>'), colors.yellow('Clearing build folders'));
        await Promise.all([
            rmrf('build'),
            rmrf('build-native')
        ]);
        console.log(colors.green('\nBuild folders cleared!'));
    } catch(err) {
        console.error(err);
    }
})();
