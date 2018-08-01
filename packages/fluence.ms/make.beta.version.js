const fs = require('fs');

const packageJson = require('./package.json');

const betaDirExists = fs.existsSync('./beta');
const settingsExists = betaDirExists ? fs.existsSync('./beta/settings.json') : false;
let settings = settingsExists ? require('./beta/settings.json') : {};

const packageVersion = packageJson.version.replace(/-beta\..*$/, '');

settings.packageVersion = settings.packageVersion || packageVersion;

if (packageVersion === settings.packageVersion) {
    settings.betaVersion = (settings.betaVersion || 0) + 1;
} else {
    settings.packageVersion = packageJson.version;
    settings.betaVersion = 0;
}

packageJson.version = `${ packageVersion }-beta.${ settings.betaVersion }`;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2), { encoding: 'utf8' });

if (!betaDirExists) {
    fs.mkdirSync('beta');
}
fs.writeFileSync('./beta/settings.json', JSON.stringify(settings, null, 2), { encoding: 'utf8' });
