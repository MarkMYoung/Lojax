//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*
@author Mark M. Young
@version 1.0.1
created 2016-06-14
*/
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
var LojaxToolbox = (function LojaxToolbox_module( window, LojaxRequest, jQuery, undefined )
{
return(
{
	'decorateWithLojaxPersistence':function( objectToDecorate, debounce_ms, lojaxOptions )
	{
		if( !(objectToDecorate instanceof Object))
		{throw( new TypeError( "'objectToDecorate' must be an object." ));}
		else if( !('url' in lojaxOptions))
		{throw( new ReferenceError( "'lojaxOptions' must specify the 'url' option (instead of passing it as a separate parameter)." ));}
		else if( Number( debounce_ms ) !== window.parseInt( debounce_ms, 10 ))
		{throw( new TypeError( "'debounce_ms' must be an integer." ));}

		objectToDecorate.$delete = function dollarDelete()
		{
			var jqDeferred = new jQuery.Deferred();
			var self = this;
			lojaxOptions = jQuery.extend( true, lojaxOptions, LojaxRequest.lojaxSettings, {'method':'DELETE'});
			jQuery.ajax( lojaxOptions.url, lojaxOptions )
			.done( function success( responseData, status_text, jqXHR )
			{jqDeferred.resolve( self, status_text, jqXHR );})
			.fail( function( jqXHR, status_text, error_thrown )
			{
				window.console.error( error_thrown );
				jqDeferred.reject( jqXHR, status_text, error_thrown );
			});
			return( jqDeferred.promise());
		};
		objectToDecorate.$save = function dollarSave()
		{
			var self = this;
			// Create a deferred object for 'this' object shared by all calls to '$save'.
			if( !self.$save.timeout_id )
			{
				self.$save.jqDeferredsBounced = [];
				self.$save.jqDeferred = new jQuery.Deferred();
			}
			// Cancel any pending saves.
			else
			{
				window.clearTimeout( self.$save.timeout_id );
				self.$save.timeout_id = null;
				self.$save.jqDeferredsBounced.push( self.$save.jqDeferred );
				self.$save.jqDeferred = new jQuery.Deferred();
				//window.console.debug( "'$save' debounced", self.$save.jqDeferredsBounced.length, "times." );
			}
			// Batch the saves into one call.
			self.$save.timeout_id = window.setTimeout( function dollarSave_timeout()
			{
				lojaxOptions = jQuery.extend( true, lojaxOptions, LojaxRequest.lojaxSettings, {'method':'POST', 'data':self});
				jQuery.ajax( lojaxOptions.url, lojaxOptions )
				.done( function success( responseData, status_text, jqXHR )
				{
					self.$save.jqDeferredsBounced.forEach( function resolve_each_bounced_deferred( jqDeferredBounced, n )
					{jqDeferredBounced.reject( jqXHR, 'abort', 'bounced' );}, self );
					self.$save.jqDeferred.resolve( self, status_text, jqXHR );
				})
				.fail( function( jqXHR, status_text, error_thrown )
				{
					window.console.error( error_thrown );
					self.$save.jqDeferredsBounced.forEach( function reject_each_bounced_deferred( jqDeferredBounced, n )
					{jqDeferredBounced.reject( jqXHR, status_text, error_thrown );}, self );
					self.$save.jqDeferred.reject( jqXHR, status_text, error_thrown );
				});
				self.$save.timeout_id = null;
			}, debounce_ms );
			return( self.$save.jqDeferred.promise());
		};
		return( objectToDecorate );
	},
});
})( window, LojaxRequest, jQuery );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//