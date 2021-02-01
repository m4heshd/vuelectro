// Add the __resPath global variable to renderer process
process.once('loaded', () => {
    global.__resPath = process.argv.slice(-1)[0];
});
