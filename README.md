<h2 align="center">
    <br>
    <img src="https://i.ibb.co/VWtG26k/vuelectro-banner.png" alt="Vuelectro">
    <br>
    <img height="35">
    Vuelectro: Minimal build tool for <a href="https://vuejs.org/">Vue.js</a> and <a href="https://www.electronjs.org/">Electron</a>
    <br>
    <img height="40">
    <!--badges-->
    <a href="https://www.npmjs.com/package/vuelectro">
        <img src="https://img.shields.io/npm/v/vuelectro?color=cc3838&style=for-the-badge" alt="Vuelectro version">
    </a> <!--NPM Version-->
    <a href="https://github.com/m4heshd/vuelectro/blob/master/LICENSE">
        <img src="https://img.shields.io/github/license/m4heshd/vuelectro?color=41b883&style=for-the-badge" alt="Vuelectro license">
    </a> <!--License-->
    <!---------->
</h2>

### What is Vuelectro?

Vuelectro is a minimalistic (being the keyword), simplistic and production-ready build/scaffolding tool that makes developing with Vue.js and Electron much easier and understandable. It's mainly for the people who appreciate simplicity over code that just "looks cool".

### Why Vuelectro?

There are many reasons for the justification of creating Vuelectro upon my own conclusions that I came to while developing with existing build tools. But the highlight is **Those tools are needlessly complicated and bloated with unnecessary code, libraries which ultimately make what's happening under the hood too cryptic and users end up having no control over the build process.** It took less time for me to build this tool than getting used to already existing tools. So here's why you should use Vuelectro.

- Vuelectro is one simple script file _(bare minimum functionality with zero unnecessary features or steps)_
- Uses a very less amount of dependencies
- Pure JS. Not transpiled _(you can intelli-click on a function and check exactly what's happening under the hood)_
- You have pretty much complete control of the build process
- Doesn't alter the Vue project structure created by Vue-cli
- Has conventional, understandable and familiar naming practices
- Not opinionated _(for the most part)_
- Directory and file structures doesn't break when going into production
- No functionality or configuration is hidden from the user

And the list goes on. But with the simplicity, they're maybe some missing crucial features that you might stumble upon. Make sure to [let me know](https://github.com/m4heshd/vuelectro/issues) about those.

### Features (pre-configured)

- Starter scaffolding
- Production build _(using [electron-builder](https://www.electron.build/))_
- Supports webpack _(not forced unlike other tools)_
- Supports obfuscation _(using [javascript-obfuscator](https://obfuscator.io/))_
- Vue.js DevTools
- Global `__resPath` and `__staticPath` in both processes _(explained below)_
- Numerous types of running modes for different scenarios

# Getting started

## Installation

Vuelectro at the moment is a cli tool itself. But you need to have Vue cli installed. If you don't have it installed, just run `npm install -g @vue/cli`. Then follow these simple steps.

⚠️ _It's highly recommended to install Vuelectro on a newly created project because it will replace some of the source files_

⚠️ _Vuelectro is targetted towards Vue 3. Not tested with Vue 2._

Open up a terminal window and run the following,

1. `vue create <your-project-name>` _(or use `vue ui`)_  and `cd` to that directory
    * ⚠️ _It's highly recommended to add plugins such as `vuex` and `vue-router` when creating the project rather than later. Make sure to use "**hash mode**" if you're using vue-router, otherwise you'll end up with a blank Electron window._

2. `npm install vuelectro --save-dev`

3.  `vuelectro init`
    * You'll be prompted to choose a preferred version of Electron here. Including the latest.

That's it. Now you're ready to code.

## Usage

`vuelectro init` will create the following files and directories in your project directory.

- **`vuelectro.config.js`** - All the configuration for Vuelectro goes in here

- **`vue.config.js`** - Configuration for Vue which is your renderer process

- **`src/electron-main.js`** - Electron main process

- **`src/preload.js`** - Preload file for the renderer

- **`resources`** - A directory for your dynamic resources which its content will be copied to your resources directory in the build. Location mapped to `__resPath`. _(For an example, your SQLite database files should go in here.)_

Vuelectro will use following directories at the time of development.

- **`app`** - A directory where your source code will be built into before running or packaging

- **`app/renderer`** - A directory where your Vue (renderer) source code will be built into

- **`dist_electron`** - A directory where all the build artifacts will go into

### Global objects and Environment variables

- **`__resPath`** - Path to your "resources" directory. Works in both development and production.

- **`__staticPath`** - Path to Vue's public aka "static" directory. Works in both development and production.

- **`process.env.VUELECTRO_ENV`** - Specifies the mode your process is running in.

### Scripts

This might look like a lot but trust me these are useful.

- **`electron:run`** - Directly runs Electron instance without building anything

- **`electron:serve`** - Runs your application using Vue dev server _(Vue devtools will work here)_

- **`electron:serve:file`** - Similar to `serve` but runs from the files instead of dev server _(Vue devtools will work here with [`allowFileAccess: true`](https://github.com/electron/electron/pull/25198))_

- **`electron:prod`** - Runs your application in production mode without packaging

- **`electron:compile:main`** - Builds just the main process files in development mode

- **`electron:compile:renderer`** - Builds just the renderer process files (Vue source files) in development mode

- **`electron:build`** - Builds and packages your application for production

## Debugging

There's no additional steps needed to debug with Vuelectro. Just regular [Electron debugging](https://www.electronjs.org/docs/tutorial/application-debugging) methods will work.

### Debugging the main process in `electron:serve`

You can pass in any number of additional arguments at the end when running `vuelectro serve` and those arguments will be passed to the Electron instance. For an example you can do the following to debug the main process at port `5858` according to [instructions here](https://www.electronjs.org/docs/tutorial/debugging-main-process).

in your `package.json`:
```js
"scripts": {
    "electron:serve": "cross-env VUELECTRO_ENV=serve vuelectro serve --inspect=5858"
}
```

This will launch your Electron instance with debugging enabled for the mentioned port. It will also support breakpoints without any issue.

# Support this project

Involvement as a contributor by adding a few lines of code, fixing a bug, responding to issues, testing etc.. would be one of the most helpful methods you could support the project. If you're not a developer but a generous person, you can send a small donation this way buy clicking the following button.

[![Donate to m4heshd](https://i.ibb.co/3vQTMts/paypal-donate-icon-7.png)](https://www.paypal.me/mpwk?locale.x=en_US)

Or you can buy me a "ko-fi" by clicking this button

[![ko-fi](https://i.ibb.co/QmQknmc/ko-fi.png)](https://ko-fi.com/m4heshd)

## Where's the massive API documentation?

There's no need because as I've mentioned many times before, this build tool is just simple like that. All you need to know about the configuration for Vuelectro is mentioned as comments inside your **`vuelectro.config.js`** file. Go check that out.

That's all you need to know. I made this as much simple as possible.
Happy coding!!

# License
This project is licensed under [MIT License](LICENSE). Use and alter at your wish.
