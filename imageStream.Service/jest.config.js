// jest.config.js
export const testEnvironment = "node";
export const transform = {
    "^.+\\.js$": "babel-jest",
};
export const moduleFileExtensions = ["js", "json", "node"];
export const testMatch = ["**/test/**/*.test.js"];
export const transformIgnorePatterns = ["/node_modules/"];
