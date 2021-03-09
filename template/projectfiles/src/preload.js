// Add __resPath & __staticPath global variables and Vuelectro environment to renderer process
process.once('loaded', () => {
    let VuelectroArgs = JSON.parse(process.argv.find(arg => arg.includes('VUELECTRO_RES_PATH')));
    global.__resPath = VuelectroArgs.VUELECTRO_RES_PATH;
    global.__staticPath = VuelectroArgs.VUELECTRO_STATIC_PATH;
    process.env.VUELECTRO_ENV = VuelectroArgs.VUELECTRO_ENV;
});
