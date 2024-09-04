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
    Langenium
    ├── .gitignore
    ├── CHANGELOG
    ├── LICENSE
    ├── README.md
    ├── client                              # Eleventy / Three.js web client
    │   ├── etc
    │   ├── src
    │   ├── .eleventy.js
    │   ├── build.mjs
    │   ├── package.json
    │   ├── package-lock.json
    │   └── watch.mjs
    ├── docs                                # Web client output folder, tracked on the gh-pages branch
    ├── game                                # Game rules and shared code used by the client and server
    │   └── TBA
    └── server                              # Node.js / Express multiplayer server
        └── TBA
```

### Tools Required

Depending on whether your task is code or media oriented, you will need some combination of the following tools to develop Langenium:

* Text editor or an IDE
* Command line interface with Node.js
* 3D modelling program
* Bitmap and vector image editors
* Digital Audio Workstation

All of the above can be accomplished with Free and Open Source Software, but there are also commercial options that some people prefer.

### Installation

All installation steps go here.

* Client
    1. Change directory to /client
    2. Install npm packages
    3. Run either `npm run build` to compile once or `npm run dev` to compile, start a web server and watch for changes.

* Game
    * TBA

* Server
    1. Change directory to /server
    2. Install npm packages
    3. Clone the .env.example file to create a .env file
    4. Start the server using `npm ecosystem.config.js`

## Features and functionality
This section breaks down how Langenium's game engine works.

### Client
Langenium can be played singleplayer (offline) or as a multiplayer game by connecting to a server.

### Game
TBA

### Server
TBA

## Deployment
TBA

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