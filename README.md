## About

lstopo - Show the topology of the system provides a detailed explanation of the hwloc system.

![](screenshot.png)

## Demo

[http://vps259935.ovh.net:3000/ped](Link URL)

## Quick start

1 - Using Web Server

```sh
$ git clone https://mlabouardy@bitbucket.org/berguizzz/ped_green.git
$ git fetch && git checkout release
```
Then deploy the src code in Web server (Apache for instance)

2 - Using Docker

```sh
$ docker run -d -p 3000:80 -v --name lstopo-visualizer mlabouardy/lstopo-visualizer
```

then go to http://localhost:3000

## CI Workflow

![](preview/ci.png)

## Help

If you run into issues, please don't hesitate to find help on the GitHub project.
