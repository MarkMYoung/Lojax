//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*
@author Mark M. Young
@version 1.0.0
created 2014-02-09
*/
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
var LojaxLawnchair = (function( window, LojaxAdapter, Lawnchair, undefined )
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
					lawnchairInstance.exists( row_key, function( exists )
					{
						if( exists )
						{
							lawnchairInstance.remove( row_key, 
								function delete_result( result )
								{
									var lojaxResponse = {};
									lojaxResponse[ LojaxAdapter.HttpStatus.NO_CONTENT ] = undefined;
									//$deferred.resolve.call( this, lojaxResponse );
									$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
								});
						}
						else
						{
							var lojaxResponse = {};
							lojaxResponse[ LojaxAdapter.HttpStatus.NOT_FOUND ] = row_key;//undefined;
							//$deferred.reject.call( this, lojaxResponse );
							$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
						}
					});
					break;
				case 'GET':
					lawnchairInstance.get( row_key, 
					function get_result( result )
					{
						var value = result;// && result.value;
						if( value )
						{
							//txParams.xhr.setResponseHeader( 'Last-Modified', (new Date()).toGMTString());
							//window.console.debug( "Request headers:", txParams.requestHeaders );
							var lojaxResponse = {};
							lojaxResponse[ LojaxAdapter.HttpStatus.OK ] = value;
							//$deferred.resolve.call( this, lojaxResponse );
							$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
						}
						else
						{
							var lojaxResponse = {};
							lojaxResponse[ LojaxAdapter.HttpStatus.NOT_FOUND ] = row_key;//undefined;
							//window.console.error( txParams );
							//$deferred.reject.call( this, lojaxResponse );
							$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
						}
					});
					break;
				case 'POST':
					lawnchairInstance.exists( row_key, function( exists )
					{
						if( !exists )
						{window.console.warn( "Lojax POSTing an object which did not already exist:", row_key );}
						var lawnchair_method = ((txParams.data instanceof Array)?('batch'):('save'));
						lawnchairInstance[ lawnchair_method ](
							//{'key':row_key, 'value':txParams.data,}, 
							angular.extend({'key':row_key}, txParams.data ),
							function post_result( result )
							{
								var value = result;// && result.value;
								if( value )
								{
									var lojaxResponse = {};
									lojaxResponse[ LojaxAdapter.HttpStatus.CREATED ] = value;
									//$deferred.resolve.call( this, lojaxResponse );
									$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
								}
								else
								{
									var lojaxResponse = {};
									lojaxResponse[ LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR ] = row_key;//undefined;
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
							angular.extend({'key':row_key}, txParams.data ),
							function put_result( result )
							{
								var value = result;// && result.value;
								if( value )
								{
									var lojaxResponse = {};
									lojaxResponse[ LojaxAdapter.HttpStatus.CREATED ] = value;
									//$deferred.resolve.call( this, lojaxResponse );
									$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
								}
								else
								{
									var lojaxResponse = {};
									lojaxResponse[ LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR ] = row_key;//undefined;
									//window.console.error( txParams );
									//$deferred.reject.call( this, lojaxResponse );
									$deferred.rejectWith( this, [txParams.xhr, 'error', lojaxResponse]);
								}
							});
					});
					break;
				default:
					window.console.error( "Unexpected LojaxLawnchair 'method' value:", txParams.method, "." );
					var lojaxResponse = {};
					lojaxResponse[ LojaxAdapter.HttpStatus.INTERNAL_SERVER_ERROR ] = txParams;//undefined;
					//$deferred.resolve.call( this, lojaxResponse );
					$deferred.resolveWith( this, [lojaxResponse, 'success', txParams.xhr]);
					break;
			}
			return( $deferred.promise());
		};
	}
	LojaxLawnchair.prototype = new LojaxAdapter();
	LojaxLawnchair.prototype.constructor = LojaxLawnchair;
	return( LojaxLawnchair );
})( window, LojaxAdapter, Lawnchair );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//