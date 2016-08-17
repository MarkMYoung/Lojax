//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*
@author Mark M. Young
@version 1.0.0
created 2014-02-09
*/
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
var LojaxLawnchair = (function( window, LojaxAdapter, Lawnchair, $, undefined )
{
	function LojaxLawnchair()
	{
		this.openTransaction = function( txParams )
		{
			//window.console.debug( "LojaxLawnchair openTransaction(", txParams, ")" );
			txParams.lawnchairInstance = new Lawnchair(
				{'name':txParams.openUsername, 'record':txParams.openPassword,}, 
				function opened(){});
		};
		this.sendQuery = function( txParams )
		{
			//window.console.debug( "LojaxLawnchair sendQuery(", txParams, ")" );
			var $deferred = $.Deferred();
			var lawnchairInstance = txParams.lawnchairInstance;
			var row_key = ((typeof( txParams.openUrl ) === 'string')
				?(txParams.openUrl):(JSON.stringify( txParams.openUrl )));
			switch( txParams.openMethod )
			{
				case 'DELETE':
					// Changed to status 200 with deleted object.
					//lawnchairInstance.exists( row_key, function( exists )
					lawnchairInstance.get( row_key, function( result )
					{
						// Changed to status 200 with deleted object.
						//if( exists )
						if( result !== undefined )
						{
							lawnchairInstance.remove( row_key, function delete_result()
							{
								// Changed to status 200 with deleted object.
								//var lojaxResponse = {'response':undefined, 'status':LojaxAdapter.HttpStatus.NO_CONTENT};
								var lojaxResponse = {'response':result, 'status':LojaxAdapter.HttpStatus.OK};
								//$deferred.resolve.call( this, lojaxResponse );
								$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
							});
						}
						else
						{
							var lojaxResponse = {'response':row_key, 'status':LojaxAdapter.HttpStatus.NOT_FOUND};
							//$deferred.reject.call( this, lojaxResponse );
							$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
						}
					});
					break;
				case 'GET':
					if( row_key === '*' )
					{
						lawnchairInstance.keys(
						function keys_result( row_keys )
						{
							lawnchairInstance.get( row_keys, 
							function get_result( result )
							{
								var value = result;
								if( value )
								{
									var lojaxResponse = {'response':value, 'status':LojaxAdapter.HttpStatus.OK};
									$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
								}
								else
								{
									var lojaxResponse = {'response':row_key, 'status':LojaxAdapter.HttpStatus.NOT_FOUND};
									$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
								}
							});
						});
					}
					else
					{
						lawnchairInstance.get( row_key, 
						function get_result( result )
						{
							var value = result;// && result.value;
							if( value )
							{
								//txParams.xhr.setResponseHeader( 'Last-Modified', (new Date()).toGMTString());
								//window.console.debug( "Request headers:", txParams.requestHeaders );
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
						});
					}
					break;
				case 'POST':
					lawnchairInstance.exists( row_key, function( exists )
					{
						if( !exists )
						{window.console.warn( "Lojax POSTing an object which did not already exist:", row_key );}
						var lawnchair_method = ((txParams.data instanceof Array)?('batch'):('save'));
						lawnchairInstance[ lawnchair_method ](
							//{'key':row_key, 'value':txParams.data,}, 
							$.extend( true, {'key':row_key}, txParams.data ),
							function post_result( result )
							{
								var value = result;// && result.value;
								if( value )
								{
									var lojaxResponse = {'response':value, 'status':LojaxAdapter.HttpStatus.CREATED};
									//$deferred.resolve.call( this, lojaxResponse );
									$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
								}
								else
								{
									var lojaxResponse = {'response':row_key, 'status':LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR};
									//window.console.error( txParams );
									//$deferred.reject.call( this, lojaxResponse );
									$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
								}
							});
					});
					break;
				case 'PUT':
					lawnchairInstance.exists( row_key, function( exists )
					{
						if( exists )
						{window.console.warn( "Lojax PUTting an object which did already exist:", row_key );}
						var lawnchair_method = ((txParams.data instanceof Array)?('batch'):('save'));
						lawnchairInstance[ lawnchair_method ](
							//{'key':row_key, 'value':txParams.data,}, 
							$.extend( true, {'key':row_key}, txParams.data ),
							function put_result( result )
							{
								var value = result;// && result.value;
								if( value )
								{
									var lojaxResponse = {'response':value, 'status':LojaxAdapter.HttpStatus.CREATED};
									//$deferred.resolve.call( this, lojaxResponse );
									$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
								}
								else
								{
									var lojaxResponse = {'response':row_key, 'status':LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR};
									//window.console.error( txParams );
									//$deferred.reject.call( this, lojaxResponse );
									$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
								}
							});
					});
					break;
				default:
					window.console.error( "Unexpected LojaxLawnchair 'method' value:", txParams.method, "." );
					var lojaxResponse = {'response':txParams, 'status':LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR};
					//$deferred.resolve.call( this, lojaxResponse );
					$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					break;
			}
			return( $deferred.promise());
		};
	}
	LojaxLawnchair.prototype = Object.create( LojaxAdapter.prototype );
	LojaxLawnchair.prototype.constructor = LojaxLawnchair;
	return( LojaxLawnchair );
})( window, LojaxAdapter, Lawnchair, jQuery );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//