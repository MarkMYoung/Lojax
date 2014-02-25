//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*
@author Mark M. Young
@version 1.0.0
created 2014-02-07
*/
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
var LojaxRequest = (function( window, LojaxAdapter, EventTargetImpl, undefined )
{
	function LojaxUpload()
	{
		var self = this;
		// Extend LojaxRequest to implement EventTargetImpl.
		EventTargetImpl.call( this );

		var writableProperties = {};
		// Add "on" event handlers as properties so they can be added to the 
		//	listeners in the correct order, removed when re-assigned, and 
		//	invoked without special consideration.
		var upload_event_names = ['abort', 'error', 
			'load', 'loadend', 'loadstart', 'progress'];
		upload_event_names.forEach( function( evt_name, e )
		{
			var on_name = 'on'.concat( evt_name );
			writableProperties[ on_name ] = null;
			Object.defineProperty( self, on_name, 
			{'enumerable':true, 
				'get':function event_handler_getter()
				{
					//window.console.debug( "LojaxUpload", on_name, "get" );
					return( writableProperties[ on_name ]);
				},
				'set':function event_handler_setter( value )
				{
					//window.console.debug( "LojaxUpload", on_name, "set" );
					this.removeEventListener( evt_name, writableProperties[ on_name ]);
					writableProperties[ on_name ] = value;
					if( value )
					{this.addEventListener( evt_name, writableProperties[ on_name ]);}
				},
			});
		});
	}
	LojaxUpload.prototype = new Object();
	LojaxUpload.prototype.constructor = LojaxUpload;
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
	function LojaxRequest( lojaxAdapter )
	{
		//X this.uid = Math.random();
		//if( typeof( lojaxAdapter ) !== 'function' )
		//{throw( new TypeError( "'lojaxAdapter' must be a function." ));}
		var self = this;
		// Extend LojaxRequest to implement EventTargetImpl.
		EventTargetImpl.call( this );
		var adapterInstance = lojaxAdapter;
		/*if( !(adapterInstance && adapterInstance instanceof LojaxAdapter))
		{
			window.console.error( adapterInstance, "not instanceof", LojaxAdapter );
			//throw( new TypeError( "'lojaxAdapter' needs to be implement LojaxAdapter." ));
		}*/

		var $deferred = $.Deferred();
		var cachedParams = undefined;
		var overriddenMimeType = undefined;
		var readOnlyProperties = 
		{
			'responseText':null,
			'responseXML':null,
			'status':0,
			'statusText':'',
		};
		var requestHeaders = {};
		var responseHeaders = {'Content-Type':"application/json",};
		var writableProperties = {'readyState':XMLHttpRequest.UNSENT,};
		function headerKeyCamelCase( header )
		{
			return( header.replace( new RegExp( '([^-]+)', 'g' ), function uc_first( token )
			{return( token.charAt( 0 ).toUpperCase().concat( token.slice( 1 ).toLowerCase()));}));
		}
		// Add "on" event handlers as properties so they can be added to the 
		//	listeners in the correct order, removed when re-assigned, and 
		//	invoked without special consideration.
		var download_event_names = ['abort', 'error', 
			'load', 'loadend', 'loadstart', 'progress', 
			'readystatechange', 'timeout'];
		download_event_names.forEach( function( evt_name, e )
		{
			var on_name = 'on'.concat( evt_name );
			writableProperties[ on_name ] = null;
			Object.defineProperty( self, on_name, 
			{'enumerable':true, 
				'get':function event_handler_getter()
				{
					//window.console.debug( "LojaxRequest", on_name, "get" );
					return( writableProperties[ on_name ]);
				},
				'set':function event_handler_setter( value )
				{
					//window.console.debug( "LojaxRequest", on_name, "set" );
					this.removeEventListener( evt_name, writableProperties[ on_name ]);
					writableProperties[ on_name ] = value;
					if( value )
					{this.addEventListener( evt_name, writableProperties[ on_name ]);}
				},
			});
		});
		// Use properites for various reasons in comments below.
		Object.defineProperties( this,
		{
			// Use accessor descriptor to trigger 'onreadystatechange'.
			'readyState':
			{'enumerable':true, 
				'get':function()
				{
					//window.console.debug( "LojaxRequest readyState get", writableProperties.readyState );
					return( writableProperties.readyState );
				},
				'set':function( value )
				{
					//window.console.info( "LojaxRequest readyState set", value );
					//var progressEvent = {'lengthComputable':false, 
					//	'loaded':0, 'total':0, 'type':'progress',};
					if( writableProperties.readyState !== value )
					{
						writableProperties.readyState = value;
						self.dispatchEvent( 'readystatechange' );
						// Dispatching additional events needs to be done manually 
						//	to prevent it from being considered a regular listener.
						switch( value )
						{
							case XMLHttpRequest.UNSENT:
								break;
							case XMLHttpRequest.OPENED:
								break;
							case XMLHttpRequest.HEADERS_RECEIVED:
								break;
							case XMLHttpRequest.LOADING:
								this.dispatchEvent( 'loadstart' );
								/*if( cachedParams.openMethod in {'DELETE':0, 'GET':0,})
								{this.dispatchEvent( progressEvent );}
								else
								{this.upload.dispatchEvent( progressEvent );}*/
								break;
							case XMLHttpRequest.DONE:
								/*if( cachedParams.openMethod in {'DELETE':0, 'GET':0,})
								{this.dispatchEvent( progressEvent );}
								else
								{this.upload.dispatchEvent( progressEvent );}*/
								this.dispatchEvent( 'load' );
								this.dispatchEvent( 'loadend' );
								break;
							default:
								window.console.error( "Unexpected LojaxRequest 'readyState' value:", value, "." );
								break;
						}
					}
				},
			},
			// Use data decriptor to prevent mangling.
			'response':
			{'enumerable':true, 'value':"", 'writable':true,},
			// Use accessor descriptor to make it read-only externally, 
			//	but assignable internally.
			'responseText':
			{'enumerable':true, 
				'get':function()
				{return( readOnlyProperties.responseText );},
			},
			// Use data decriptor to prevent mangling.
			'responseType':
			{'enumerable':true, 'value':"text"/* or "json"*/, 'writable':true,},
			// Use accessor descriptor to make it read-only externally, 
			//	but assignable internally.
			'responseXML':
			{'enumerable':true, 
				'get':function()
				{
					//window.console.debug( "LojaxRequest responseXML get" );
					return( readOnlyProperties.responseXML );
				},
			},
			// Use accessor descriptor to make it read-only externally, 
			//	but assignable internally.
			'status':
			{'enumerable':true, 
				'get':function()
				{
					//window.console.debug( "LojaxRequest status get" );
					return( readOnlyProperties.status );
				},
			},
			// Use accessor descriptor to make it read-only externally, 
			//	but assignable internally.
			'statusText':
			{'enumerable':true, 
				'get':function()
				{
					//window.console.debug( "LojaxRequest statusText get" );
					return( readOnlyProperties.statusText );
				},
			},
			// Use data decriptor to prevent mangling.
			'timeout':// default of 0 means no timeout
			{'enumerable':true, 'value':0, 'writable':true,},
			// Use data decriptor to prevent mangling and make it read-only.
			'upload':
			{'enumerable':true, 'value':new LojaxUpload(), 'writable':false,},
			// Use data decriptor to prevent mangling.
			'withCredentials':
			{'enumerable':true, 'value':false, 'writable':true,},
		});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		// Member functions are inside the constructor to allow access to the 
		//	hidden property objects.
		// @returns void
		this.abort = function()
		{
			//window.console.debug( "LojaxRequest abort()." );
			//? $deferred.reject( "abort" );
			this.dispatchEvent( 'abort' );
		};
		// @returns string or null
		this.getAllResponseHeaders = function()
		{
			//window.console.debug( "LojaxRequest getAllResponseHeaders()." );
			var all_response_headers = Object.keys( responseHeaders )
			.reduce( function concatentate_headers( result, header, h )
			{
				var value = ((header === 'Content-Type' && !!overriddenMimeType)
					?(overriddenMimeType):(responseHeaders[ header ]));
				return( result.concat( header, ': ', value ));
			}, "\n" );
			return( all_response_headers );
		};
		// @returns string or null
		this.getResponseHeader = function( header )
		{
			//window.console.info( "LojaxRequest getResponseHeader(", header, ")." );
			return( responseHeaders[ header ]);
		};
		// @returns void
		this.open = function( method, url, async, username, password )
		{
			//window.console.warn( "LojaxRequest 'open(", method, ",", url, ",", async, ",", username, ",", password, ")" );
			//window.console.debug( "LojaxRequest open(", method, ", ", url, ", ", async, ", ", username, ", ", password, ")." );
			cachedParams = {'openAsync':async, 'openMethod':method.toUpperCase(), 
				'openPassword':password || LojaxRequest.lojaxSettings.password, 
				'openUrl':url, 'openUsername':username || LojaxRequest.lojaxSettings.username,
				'xhr':self,};
			if( !cachedParams.openUsername )
			{window.console.warn( "LojaxRequest 'open' called with empty 'username'." );}
			if( !cachedParams.openPassword )
			{window.console.warn( "LojaxRequest 'open' called with empty 'password'." );}
			//try
			//{
				adapterInstance.openTransaction( cachedParams );
				// Setting 'readyState' asynchronously does not work.
				self.readyState = XMLHttpRequest.OPENED;
			//}
			//catch( exc )
			//{window.console.error( exc );/*throw( exc );*/}
		};
		// @returns void
		this.overrideMimeType = function( mime_type )
		{
			//window.console.info( "LojaxRequest overrideMimeType(", mime, ")." );
			if( this.readyState > XMLHttpRequest.OPENED )
			{throw( new Error( "LojaxRequest overrideMimeType must be called before calling 'send'." ));}
			overriddenMimeType = mime_type;
		};
		// @returns void
		this.send = function( data )
		{
			//window.console.debug( "LojaxRequest send(", data, ")." );
			var $promise = $deferred.promise();
			// If useing jQuery, this is passed via 'xhrFields.timeout', NOT 'timeout'.
			if( !isNaN( self.timeout ) && self.timeout > 0 )
			{
				var timeout_id = window.setTimeout( function set_send_timeout()
				{
					window.console.warn( "LojaxRequest timeout expired" );
				}, self.timeout );
				$promise.always( function clear_send_timeout()
				{
					window.console.debug( "LojaxRequest timeout cleared" );
					window.clearTimeout( timeout_id );
				});
			}
			$promise.done( function( responseStatusValuePair )
			{
				//window.console.debug( "LojaxRequest resolving..." );
				self.readyState = XMLHttpRequest.HEADERS_RECEIVED;
				self.readyState = XMLHttpRequest.LOADING;

				var status_str = Object.keys( responseStatusValuePair ).shift();
				var response_value = responseStatusValuePair[ status_str ];
				readOnlyProperties.responseText = ((typeof( response_value ) === 'object')
						?(JSON.stringify( response_value ))
						:((!!response_value)?(response_value):(null)));
				responseHeaders['Content-Length'] = readOnlyProperties.responseText 
					&& readOnlyProperties.responseText.length || 0;
				if( self.responseType === 'text' )
				{
					self.response = readOnlyProperties.responseText;
				}
				else if( self.responseType === 'json' )
				{
					self.response = ((typeof( response_value ) === 'string')
						?(JSON.parse( response_value )):(response_value));
					/*self.response = response_value;
					if( typeof( response_value ) === 'string' )
					{
						try{self.response = JSON.parse( response_value );}
						catch( exc ){}
					}*/
				}
				readOnlyProperties.status = parseInt( status_str, 10 );
				readOnlyProperties.statusText = LojaxAdapter.StatusTextByCode[ readOnlyProperties.status ];
				//? self.dispatchEvent({'currentTarget':self, 'target':self, 'type':'error',});
				// Update 'readyState' last because it triggers 'readystatechange'.
				self.readyState = XMLHttpRequest.DONE;
				//if( false )
				//{throw( Error());}
			})
			.fail( function( responseObj )
			{
				//window.console.debug( "LojaxRequest failing..." );
				self.dispatchEvent( 'error' );
				self.readyState = XMLHttpRequest.DONE;
				if( responseObj instanceof Error )
				{throw( responseObj );}
			});
			cachedParams.data = data;
			cachedParams.requestHeaders = requestHeaders;
			//cachedParams.xhr = self;
			switch( cachedParams.openMethod )
			{
				case 'POST':case 'PUT':
					if( !data )
					{window.console.warn( "LojaxRequest 'send' called with empty 'data' on", cachedParams.openMethod, "method." );}
					// Fall through.
				case 'DELETE':case 'GET':
					adapterInstance.sendQuery( cachedParams ).done( function( responseData, status_text, jqXHR )
					{$deferred.resolve( responseData );})
					.fail( function( jqXHR, status_text, error_thrown )
					{$deferred.reject( error_thrown );});
					break;
				case 'OPTIONS':
					window.console.warn( "Unimplemented LojaxRequest 'method' value:", cachedParams.openMethod, "." );
					break;
				default:
					window.console.error( "Unexpected LojaxRequest 'method' value:", cachedParams.openMethod, "." );
					break;
			}
		};
		// @returns void
		this.setRequestHeader = function( header, value )
		{
			header = headerKeyCamelCase( header );
			window.console.info( "LojaxRequest setRequestHeader(", header, ", ", value, ")." );
			if( this.readyState !== XMLHttpRequest.OPENED )
			{throw( new Error( "LojaxRequest setRequestHeader must be called when 'readyState' is OPENED (after 'open', but before 'send')." ));}
			requestHeaders[ header ] = value;
		};
		// This method is added so adapters can pass information in headers.
		Object.defineProperties( this, 
		{
			'setResponseHeader':{'value':function( header, value )
			{
				header = headerKeyCamelCase( header );
				responseHeaders[ header ] = value;
			}, 'writable':false,},
		});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
	}
	LojaxRequest.prototype = new Object();//new XMLHttpRequest();
	LojaxRequest.prototype.constructor = LojaxRequest;
	Object.defineProperties( LojaxRequest, 
	{
		// Setting 'processData' to false is HIGHLY recommended.
		'lojaxSettings':{'value':{/*'isLocal':true, */'processData':false,}, 'writable':true,},
		'lojaxSetup':{'value':function( lojaxOptions )
		{
			for( var m in lojaxOptions )
			{this.lojaxSettings[ m ] = lojaxOptions[ m ];}
		}, 'writable':false,},
		'findRequestHeader':{'value':function( requestHeaders, header )
		{
			header = headerKeyCamelCase( header );
			var value = Object.keys( requestHeaders ).reduce( function( result, key, i )
			{
				if( key === header )
				{result = requestHeaders[ key ];}
				return( result );
			}, null );
			return( value );
		}, 'writable':false,},
	});
	return( LojaxRequest );
})( window, LojaxAdapter, EventTargetImpl );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*var LojaxResponse = (function( window, undefined )
{
	function LojaxResponse( method, url, status_code, status_text )
	{
		Object.defineProperties( this, 
		{
			'method':
			{'enumerable':true, 'value':method, 'writable':false,},
			'url':
			{'enumerable':true, 'value':url, 'writable':false,},
			'status':
			{'enumerable':true, 'value':status_code, 'writable':false,},
			'statusText':
			{'enumerable':true, 'value':status_text, 'writable':false,},
		});
	}
	LojaxResponse.prototype = new Object();
	LojaxResponse.prototype.constructor = LojaxResponse;
	return( LojaxResponse );
})( window );*/
