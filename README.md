# Langenium

![Current Version](https://img.shields.io/badge/version-v0.6-blue)
![GitHub contributors](https://img.shields.io/github/contributors/OpenStudiosCo/Langenium)
![GitHub stars](https://img.shields.io/github/stars/OpenStudiosCo/Langenium?style=social)
![GitHub forks](https://img.shields.io/github/forks/OpenStudiosCo/Langenium?style=social)

Welcome to Langenium! An open source MMORPG.

Visit the [official website](https://langenium.com) to learn more or clone this repository to work with the code.

## Table of Contents
- [Getting Started](#getting-started)
    - [Tools Required](#tools-required)
    - [Installation](#installation)
- [Features and functionality](#features-and-functionality)
    - [Client](#client)
    - [Game](#game)
    - [Server](#server)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Authors](#authors)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Getting Started

The project is split into three main folders: Client, Game and Server.
- /client contains the Eleventy based frontend client
- /game contains shared game logic like object definitions and game loop functions
- /server contains the Express based server engine

```
    Langenium Repository Root/
    ├── .gitignore
    ├── CHANGELOG
    ├── LICENSE
    ├── README.md
    ├── client/                              # Eleventy / Three.js web client
    │   ├── etc/
    │   ├── src/
    │   ├── .eleventy.js
    │   ├── build.mjs
    │   ├── package.json
    │   ├── package-lock.json
    │   └── watch.mjs
    ├── docs/                                # Web client output folder, tracked on the gh-pages branch
    ├── game/                                # Game rules and shared code used by the client and server
    │   └── src/
    └── server/                              # Node.js / Express multiplayer server
        └── etc/
        └── src/
```

### Software Tools Required

All Langenium development can be accomplished with Free and Open Source Software, but there are also commercial options that have been used due to personal preferences.

Depending on whether your task is code or media oriented, you will need some combination of these software tools to develop Langenium:

* Text editor or an IDE
* Command line interface with Node.js
* 3D modelling program
* Bitmap and vector image editors
* Digital Audio Workstation

### Installation

All installation steps go here.

* Client
    1. Change directory to /client
    2. Install npm packages
    3. Run either `npm run build` to compile once or `npm run dev` to compile, start a web server and watch for changes.

* Game
    * No installation required, common game source code is imported by the client and server respectively.

* Server
    1. Change directory to /server
    2. Install npm packages
    3. Clone the .env.example file to create a .env file
    4. Start the server using `npm run [dev|prod]`

## Features and functionality
This section breaks down how Langenium's game engine works.

### Dependencies
The game client is a Single Page Application (SPA) that is written in Javascript.

The game's logic and server code is written in TypeScript.

### Modes
Singleplayer (offline) or multiplayer (via server)

### Game Client
- Uncoupled boot-up script with built-in preloader screen
- Scene graph management with a global application structure for adding new things to the animation loop
- Procedurally generated scenery with boolean tools to create more assets
- Shader based reusable material library recreating materials from Blender using custom GLSL
- Support keyboard, mouse and touch based controls
- Responsive cross platform UI with a simple API to extend it
- Dynamic performance tuning to maintain FPS on less powerful devices

### Client and Server
- Configurable AI for bot pathfinding and custom behaviours
- Shared codebase for game logic and data objects such as aircraft speed and damage calculations

### Server
- Dot Env file based configuration
- Express application framework for routing and structure
- Multiplayer using WebSockets ( socket.io )

## Development

### Setting up

Depending on your needs, you may wish to setup just the game client or the game client and server.

A free multiplayer server is currently hosted by [Open Studios](https://github.com/OpenStudiosCo), but it's the same one used for [langenium.com](https://langenium.com) and provided with no uptime guarantees.

### Frontend

TBA

### Backend

TBA

## Deployment

### Updating the live site
The main Langenium site (langenium.com) is based on the `gh-pages` branch.

Unlike the `master` branch, the `gh-pages` branch tracks build artefacts so they can be served statically on Github Pages.

1. Checkout the gh-pages branch
    - `git checkout gh-pages`
2. Merge in the latest updates to go out
    - `git merge master`
3. Build the game client
    - `npm run build`

### Updating Node dependencies
We recommend using a tool like [NPM Check Updates](https://www.npmjs.com/package/npm-check-updates) to maintain package.json files 

## Contributing

We'd love to have your helping hand on `Langenium`! See the [issues list][issues] for the latest activity in the project.

This is currently an indie passion project so all ideas are welcome. Feel free to lodge an issue, PR or get in touch to discuss how you would like to contribute. A project as ambitious as this needs all the help it can get!

## Versioning

See the [changelog][changelog] for an overview of Langenium's history.

## Authors

#### Paul Brzeski
* [GitHub]
* [LinkedIn]

You can also see the complete list of [contributors][contributors] who participated in this project.

## License

`Langenium` is open source software [licensed as MIT][license].

## Acknowledgments

Langenium is the result of many direct and indirect contributions from talented people all over the world.

For a full list please see the [credits][credits]

[//]: # (HyperLinks)

[GitHub Repository]: https://github.com/OpenStudiosCo/Langenium
[Official Websiet]: https://langenium.com/

[GitHub]: https://github.com/paulbrzeski
[LinkedIn]: https://www.linkedin.com/in/paul-b-23620b209/

[contributors]: https://github.com/OpenStudiosCo/Langenium/contributors
[changelog]: https://github.com/OpenStudiosCo/Langenium/blob/master/CHANGELOG.md
[credits]: https://github.com/OpenStudiosCo/Langenium/blob/master/CREDITS.md
[license]: https://github.com/OpenStudiosCo/Langenium/blob/master/LICENSE
[issues]: https://github.com/OpenStudiosCo/Langenium/issues