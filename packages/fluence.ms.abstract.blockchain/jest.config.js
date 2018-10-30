module.exports = {
    "collectCoverageFrom": [
        "src/**/*.ts"
    ],
    "globals": {
        "ts-jest": {
            "skipBabel": true
        }
    },
    "testResultsProcessor": "jest-multi-test-result-processor",
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
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