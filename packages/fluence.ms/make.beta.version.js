const fs = require('fs');
const resolve = require('path').resolve;
const homedir = require('os').homedir();

const packageJson = require('./package.json');
const betaDirPath = resolve(homedir, './beta');
const betaDirExists = fs.existsSync(betaDirPath);

const settingsPath = resolve(betaDirPath, './settings.json');
const settingsExists = betaDirExists ? fs.existsSync(settingsPath) : false;
let settings = settingsExists ? require(settingsPath) : {};

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
    fs.mkdirSync(betaDirPath);
}
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), { encoding: 'utf8' });
