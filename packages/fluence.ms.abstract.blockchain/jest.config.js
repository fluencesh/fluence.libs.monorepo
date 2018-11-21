const fs = require('fs');

const exists = fs.existsSync('.env');
if (exists) {
    const envVars = fs.readFileSync('.env').toString('utf8').split('\n');
    envVars.forEach((envVar) => {
        const [ varName, varValue ] = envVar.split('=');
        process.env[varName] = varValue;
    })
}

module.exports = {
    "collectCoverageFrom": [
        "src/**/*.ts"
    ],
    "globals": {
        "ts-jest": {
            "skipBabel": true,
            "diagnostics": false
        }
    },
    "testResultsProcessor": "jest-multi-test-result-processor",
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "test\/.*\\.spec\\.ts$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "coveragePathIgnorePatterns": [
        "<rootDir>/.*?\\.d\\.ts$",
        "<rootDir>/.*?\\.mock\\.ts$"
    ],
    "coverageReporters": [
        "json",
        "lcov",
        "text",
        "clover",
        "cobertura"
    ]
};