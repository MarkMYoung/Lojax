//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
/*
@author Mark M. Young
@version 1.0.0
created 2014-02-07
*/
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
var LojaxAdapter = (function( undefined )
{
	function LojaxAdapter(){}
	LojaxAdapter.prototype = new Object();
	LojaxAdapter.prototype.constructor = LojaxAdapter;
	Object.defineProperties( LojaxAdapter, 
	{
		'StatusTextByCode':{'value':
		{
			200:'OK',
			201:'Created',
			202:'Accepted',
			204:'No Content',
			206:'Partial Content',
			304:'Not Modified',
			400:'Bad Request',
			404:'Not Found',
			408:'Request Timeout',
			412:'Precondition Failed',
			500:'Internal Server Error',
		}, 'writable':false,},
	});
	// Build the constants dynamically so the two look-ups are always in agreement.
	var httpStatuses = Object.keys( LojaxAdapter.StatusTextByCode ).reduce( function( result, each )
	{
		var status_code = window.parseInt( each, 10 );
		var constant = LojaxAdapter.StatusTextByCode[ status_code ].replace( / /g, '_' ).toUpperCase();
		result[ constant ] = status_code;
		return( result );
	}, {});
	Object.defineProperties( LojaxAdapter, {'HttpStatus':{'value':httpStatuses, 'writable':false,},});
	/*
	* @returns void
	* @param transactionParams object containing:
	*	* openAsync boolean async passed to XMLHttpRequest.open.
	*	* openMethod string HTTP method pass to XMLHttpRequest.open.
	*	* openUrl string URL passed to XMLHttpRequest.open.
	*	* openUsername string username passed to XMLHttpRequest.open.
	*	* openPassword string password passed to XMLHttpRequest.open.
	*	* xhr object LojaxRequest instance.
	*	* Additional data can be cached here and retrieved in 'openTransaction'.
	*/
	LojaxAdapter.prototype.openTransaction = function( transactionParams )
	{};
	/*
	* @returns Deferred promise (which implements 'done' and 'fail').
	* @param transactionParams object containing:
	*	* data any value passed to XMLHttpRequest.send.
	*	* openAsync boolean async passed to XMLHttpRequest.open.
	*	* openMethod string HTTP method pass to XMLHttpRequest.open.
	*	* openUrl string URL passed to XMLHttpRequest.open.
	*	* openUsername string username passed to XMLHttpRequest.open.
	*	* openPassword string password passed to XMLHttpRequest.open.
	*	* xhr object LojaxRequest instance.
	*/
	LojaxAdapter.prototype.sendQuery = function( transactionParams )
	{throw( new Error( "'sendQuery' not implemented." ));};
	return( LojaxAdapter );
})();
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//