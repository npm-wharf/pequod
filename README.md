# pequod

A lib and command line utility to help with manipulating the Docker CLI. Built to work nicely with [buildGoggles](https://github.com/arobson/buildGoggles).

Primary use case (for now) is to read the `.buildinfo.json` file and tag a Docker image with all the tags found. Yeah, it _is_ simple, but it turns out this is an immense pain in the neck to pull off in most CIs/bash and pretty simple in Node.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

## Testing
A local Docker registry for the push integration tests.

__Start local registry__
```bash
./setup-registry.sh
```

__Tear down local registry__
```bash
./kill-registry.sh
```

## API
All calls return promises which resolve or reject with the output of the command.

```js
var pequod = require( "pequod" )( false, logger ); // sets sudo to false
```

 * logger - optional log call that accepts string output from Docker process

#### build( tag, _workingPath_, _file_, _cacheFrom_ )

#### `build ( tag, [options] )`

`options` is a hash of fields:

 * `working` - default: "./"
 * `file` - default: "Dockerfile"
 * `cacheFrom` - provide a image specification for Docker to build off of
 * `args` - a hash of key/values used to populate `ARG`s defined in the Dockerfile

```js
pequod
  .build( "test-image" )
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### create( imageName, [options] )

Creates a container from an image with the following available options:

 * `name` - a string providing a friendly name
 * `entrypoint` - the entrypoint to use for the container
 * `env` - a hash of key/value pairs to use as environment variables
 * `links` - an array of named container links to other containers
 * `ports` - a hash of key/value pairs to use for host -> container port mappings
 * `volumes` - a hash of host paths to mount to to container paths

#### exportContainer( container, [options] )

Exports a container either as a tarball or to a pipe with the following options:

 * `output` - the path to the tarball file to save the container's state in

If the `output` option is left off, the call will resolve the output stream which can then be piped to something else.

#### importContainer( source, target, [options])

Imports either a stream or a tarball into a new, single image layer. If `source` is a path to a file, it will use the tarball, if `source` is set to the string `"pipe"` then it will expect the option `pipe` to be set to the stream containing the image.

Options:

 * `changes` - an array of legal Docker image changes to make to the image during import. See [ https://docs.docker.com/engine/reference/commandline/import/#extended-description](Docker's documentation) for details.
 * `message` - a custom commit message to set when creating the new layer

#### info()

```js
pequod
  .info()
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### inspect( image )

```js
pequod.inspect('repo/image:tag')
  .then( function( data ) {
    // process data
  } );
```

Data structure:

```js
{
  Id: 'sha256:[sha]',
  RepoTags: [
    'repo/image:tag'
  ],
  RepoDigests: [
    'repo/image@sha256:[sha]'
  ],
  Parent: '',
  Comment: '',
  Created: 'ISO timestamp',
  Container: 'attached container id',
  ContainerConfig: {
    Hostname: '',
    Domainname: '',
    User: '',
    AttachStdin: Boolean,
    AttachStdout: Boolean,
    AttachStderr: Boolean,
    Tty: Boolean,
    OpenStdin: Boolean,
    StdinOnce: Boolean,
    Env: [
      'ENV=value'
    ],
    Cmd: [
      '/bin/sh',
      '-c',
      '#(nop) ',
      'CMD [\"/bin/sh\" \"-c\" \"./kick.sh\"]'
    ],
    ArgsEscaped: Boolean,
    Image: 'sha256:[sha]',
    Volumes: [] | null,
    WorkingDir: '/',
    Entrypoint: '' | null,
    OnBuild: [],
    Labels: {}
  },
  DockerVersion: '',
  Author: '',
  Config: {
    Hostname: '',
    Domainname: '',
    User: '',
    AttachStdin: Boolean,
    AttachStdout: Boolean,
    AttachStderr: Boolean,
    Tty: Boolean,
    OpenStdin: Boolean,
    StdinOnce: Boolean,
    Env: [
      'ENV=value'
    ],
    Cmd: [
      '/bin/sh',
      '-c',
      './kick.sh'
    ],
    ArgsEscaped: Boolean,
    Image: 'sha256:[sha]',
    Volumes: [] | null,
    WorkingDir: '/',
    Entrypoint: '' | null,
    OnBuild: [],
    Labels: null
  },
  Architecture: 'amd64',
  Os: 'linux',
  Size: #,
  VirtualSize: #,
  GraphDriver: {
    Data: {
      LowerDir: '/var/lib/docker/overlay2...',
      MergedDir: '',
      UpperDir: '',
      WorkDir: ''
    },
    Name: 'overlay2'
  },
  RootFS: {
    Type: 'layers',
    Layers: [
      'sha256:[sha]',
      ...
    ]
  },
  Metadata: {
    LastTagTime: 'ISO '
  }
}
```

#### login( user, pass, _server_ )

`server` is optional and defaults to the official Docker hub.

```js
pequod
  .login( '$DOCKER_USER', '$DOCKER_PASS' )
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### pull( image )

Pulls an image.

```js
pequod
  .pull( 'test-image' )
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### push( image )
Pushes the image.

```js
pequod
  .push( 'test-image' )
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### pushTags( image )

Pushes all tags specified in `./.buildinfo.json`.

```js
pequod.pushTags('test-image');
```

#### tag( source, target )

Tags the source image with the specified target tag.

```js
pequod
  .tag( 'test-image', 'test-image:1.1' )
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### tagImage( source )

Tags the source image according to a `./.buildinfo.json`.

```js
pequod.tagImage('test-image');
```

#### removeContainer( containerName/containerId )

Removes the container from the local daemon by name or id.

```js
pequod
  .removeContainer('')
```

#### removeImage( imageName )

Removes the image (or untags it).

```js
pequod
  .removeImage( 'test-image' )
  .then( function( list ) {
    // the list of console lines output
  } );
```

#### version()

```js
pequod
  .version()
  .then( function( list ) {
    // the list of console lines output
  } );
```

There's more to it than this, but give this is really the primary reason for its existence, I'm gonna keep things boring for now √

[travis-url]: https://travis-ci.org/npm-wharf/pequod
[travis-image]: https://travis-ci.org/npm-wharf/pequod.svg?branch=master
[coveralls-url]: https://coveralls.io/github/npm-wharf/pequod?branch=master
[coveralls-image]: https://coveralls.io/repos/github/npm-wharf/pequod/badge.svg?branch=master
