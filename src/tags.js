var when = require( "when" );
var fs = require( "fs" );
var path = require( "path" );

function applyTag( docker, source, target ) {
  return docker.tag( source, target );
}

function buildInfoExists( file ) {
  return fs.existsSync( file );
}

function getImageTag( source, tag ) {
  // if the source includes a registry with a port, that has to be included in
  var segments = source.split( ":" );
  var slashIndex = source.indexOf( "/" );
  if( slashIndex >= 0 ) {
    var colIndex = source.indexOf( ":" );
    if( colIndex < slashIndex ) {
      if( segments.length < 3 ) {
        return [ source, tag ].join( ":" );
      } else {
        return [ segments[ 0 ], segments[ 1 ], tag ].join( ":" );
      }
    } else {
      return [ segments[ 0 ], tag ].join( ":" );
    }
  } else {
    return [ segments[ 0 ], tag ].join( ":" );
  }
}

function loadTagsFrom( file ) {
  return when.promise( function( resolve, reject ) {
    fs.readFile( file, 'utf8', function( err, content ) {
      if( err ) {
        reject( err );
      } else {
        var json = JSON.parse( content );
        resolve( json.tag );
      }
    } );
  } );
}

function pushTag( docker, target ) {
  return docker.push( target );
}

function pushTags( docker, source, tag ) {
  if( Array.isArray( tag ) ) {
    return when.all( tag.map( pushTags.bind( null, docker, source ) ) );
  } else {
    var target = tag;
    if( !tagIsCompleteSpec( tag ) ) {
      target = getImageTag( source, tag );
    }
    return pushTag( docker, target );
  }
}

function selectTags( docker, op, source, tag ) {
  if( tag ) {
    if( buildInfoExists( tag ) ) {
      return loadTagsFrom( tag )
        .then( function( tags ) {
          return op( docker, source, tags );
        } );
    } else {
      return op( docker, source, tag );
    }
  } else {
    return selectTags( docker, op, source, "./.buildinfo.json" );
  }
}

function tagImage( docker, source, tag ) {
  if( Array.isArray( tag ) ) {
    return when.all( tag.map( tagImage.bind( null, docker, source ) ) );
  } else {
    var target = tag;
    if( !tagIsCompleteSpec( tag ) ) {
      target = getImageTag( source, tag );
    }
    return applyTag( docker, source, target );
  }
}

// determine if the tag specifies a full docker image name
function tagIsCompleteSpec( tag ) {
  return ( tag.indexOf( ":" ) >= 0 || tag.indexOf( "\/" ) >= 0 );
}

module.exports = function( docker ) {
  return {
    tagImage: selectTags.bind( null, docker, tagImage ),
    pushTags: selectTags.bind( null, docker, pushTags )
  };
};