# Multi-shell

#### This application is made to run commands programmed in a console.

## Dependencies
Firebase
Docker
server SSH

# How to start application

## Installation

#### Install required tools `docker`, `docker-compose` and `ssh server`:

##### To install ssh server on Ubuntu:
```
https://www.simplified.guide/ubuntu/install-ssh-server
```
#### Crate an app in firebase of google, and get credentials

#### Configure the files `server.js` and `index.html`:

##### `server.js`:
```
}).connect({ // Your data ssh connection
    host: '172.17.0.1', // Your host server ssh
    username: 'user',
    password: '1234'
});
```

##### `index.html`:
```
var config = { // Your data firebase connection
    apiKey: "your apikey",
    authDomain: "your info",
    databaseURL: "your info",
    projectId: "your info",
    storageBucket: "",
    messagingSenderId: "your info"
};
```

## RUN
```
docker-compose up
```

##### some help obtained from this post:
```
https://stackoverflow.com/questions/38689707/connecting-to-remote-ssh-server-via-node-js-html5-console
```