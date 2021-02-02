// Add the __resPath global variable to renderer process
process.once('loaded', () => {
    global.__resPath = JSON.parse(process.argv.find(arg => arg.includes('VUELECTRO_RES_PATH'))).VUELECTRO_RES_PATH;
});
