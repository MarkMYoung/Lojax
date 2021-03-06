//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*
@author Mark M. Young
@version 1.0.0
created 2014-03-03
*/
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
var LojaxLocalStorage = (function( window, LojaxAdapter, Lawnchair, undefined )
{
	function deserialize( string )
	{
		var object;
		try{object = JSON.parse( string );}
		catch( exc )
		{
			window.console.warn( 'LojaxLocalStorage', exc, 'JSON.parse', string );
			object = string;
		}
		return( object );
	}
	function serialize( object )
	{
		var string;
		try{string = JSON.stringify( object );}
		catch( exc )
		{
			window.console.warn( 'LojaxLocalStorage', exc, 'JSON.stringify', object );
			string = object;
		}
		return( string );
	}
	function LojaxLocalStorage()
	{
		this.openTransaction = function( txParams )
		{
			txParams.storageInstance = ((txParams.openUsername === 'sessionStorage')
				?(window.sessionStorage):(window.localStorage));
		};
		this.sendQuery = function( txParams )
		{
			//window.console.debug( "LojaxLocalStorage sendQuery(", txParams, ")" );
			var $deferred = $.Deferred();
			var storageInstance = txParams.storageInstance;
			var row_key = serialize( txParams.openUrl );
			switch( txParams.openMethod )
			{
				case 'DELETE':
					var storedItem = storageInstance.getItem( row_key );
					if( !!storedItem )
					{
						storageInstance.removeItem( row_key );
						// Changed to status 200 with deleted object.
						//var lojaxResponse = {'response':undefined, 'status':LojaxAdapter.HttpStatus.NO_CONTENT};
						var lojaxResponse = {'response':storedItem, 'status':LojaxAdapter.HttpStatus.OK};
						//$deferred.resolve.call( this, lojaxResponse );
						$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					}
					else
					{
						var lojaxResponse = {'response':row_key, 'status':LojaxAdapter.HttpStatus.NOT_FOUND};
						//$deferred.reject.call( this, lojaxResponse );
						$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
					}
					break;
				case 'GET':
					if( row_key === '*' )
					{
						var row_keys = [];
						for( var i = 0; i < storageInstance.length; ++i )
						{row_keys.push( storageInstance.key( i ));}
						var storedItems = row_keys.map( function( each, n, every )
						{storageInstance.getItem( each );}, this );

						//TODO parse the Accept header more precisely
						var accept_header = txParams.requestHeaders['Accept'];
						// Parse as JSON unless plain text is expected.
						var values = ((accept_header.indexOf( '*/*' ) > -1
								|| accept_header.indexOf( 'application/json' ) > -1)
							?(deserialize( storedItems )):(storedItems));
						var lojaxResponse = {'response':values, 'status':LojaxAdapter.HttpStatus.OK};
						$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					}
					else
					{
						var storedItem = storageInstance.getItem( row_key );
						if( !!storedItem )
						{
							//txParams.xhr.setResponseHeader( 'Last-Modified', (new Date()).toGMTString());
							//window.console.debug( "Request headers:", txParams.requestHeaders );
							//TODO parse the Accept header more precisely
							var accept_header = txParams.requestHeaders['Accept'];
							// Parse as JSON unless plain text is expected.
							var value = ((accept_header.indexOf( '*/*' ) > -1
									|| accept_header.indexOf( 'application/json' ) > -1)
								?(deserialize( storedItem )):(storedItem));
							var lojaxResponse = {'response':value, 'status':LojaxAdapter.HttpStatus.OK};
							//$deferred.resolve.call( this, lojaxResponse );
							$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
						}
						else
						{
							var lojaxResponse = {'response':row_key, 'status':LojaxAdapter.HttpStatus.NOT_FOUND};
							//window.console.error( txParams );
							//$deferred.reject.call( this, lojaxResponse );
							$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
						}
					}
					break;
				case 'POST':
					var storedItem = storageInstance.getItem( row_key );
					if( !storedItem )
					{window.console.warn( "Lojax POSTing an object which did not already exist." );}
					// Parse as JSON unless plain text is expected.
					var content_type_header = txParams.requestHeaders['Content-Type'];
					var value = ((content_type_header.indexOf( 'application/json' ) > -1)
						?(serialize( txParams.data )):(txParams.data));
					storageInstance.setItem( row_key, value );
					var lojaxResponse = {'response':value, 'status':LojaxAdapter.HttpStatus.CREATED};
					//$deferred.resolve.call( this, lojaxResponse );
					$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					break;
				case 'PUT':
					var storedItem = storageInstance.getItem( row_key );
					if( !!storedItem )
					{window.console.warn( "Lojax PUTting an object which did already exist." );}
					// Parse as JSON unless plain text is expected.
					var content_type_header = txParams.requestHeaders['Content-Type'];
					var value = ((content_type_header.indexOf( 'application/json' ) > -1)
						?(serialize( txParams.data )):(txParams.data));
					storageInstance.setItem( row_key, value );
					var lojaxResponse = {'response':value, 'status':LojaxAdapter.HttpStatus.CREATED};
					//$deferred.resolve.call( this, lojaxResponse );
					$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					break;
				default:
					window.console.error( "Unexpected LojaxLocalStorage 'method' value:", txParams.method, "." );
					var lojaxResponse = {'response':txParams, 'status':LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR};
					//$deferred.resolve.call( this, lojaxResponse );
					$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					break;
			}
			return( $deferred.promise());
		};
	}
	LojaxLocalStorage.prototype = Object.create( LojaxAdapter.prototype );
	LojaxLocalStorage.prototype.constructor = LojaxLocalStorage;
	return( LojaxLocalStorage );
})( window, LojaxAdapter, Lawnchair );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//