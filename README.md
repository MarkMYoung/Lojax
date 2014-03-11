Lojax
=====
WebSQL has been supported by Safari since March 2008, by Chrome since January 2010, by Opera since March 2010, and even by BlackBerry Browser since May 2011.  Somewhere between January 2010 and July 2013 (yes, 2½ years which could have been spent on development), IndexedDB was created.  What better way for Firefox and Internet Explorer to catch up in the browser races than to completely change the direction of a race?

During my developement using Ajax in conjuction with browser storage, it occurred to me that an interface existed prior to WebSQL to access data with JavaScript--`XMLHttpRequest`.  This library allows developers to differentiate between local and remote data with just a few lines of code.

jQuery is not required, but here is an example using an adpapter to [Lawnchair](https://github.com/brianleroux/lawnchair "brianleroux/lawnchair"), called `LojaxLawnchair`:
```javascript
// Lojax allows adapters to be stateless so only one instance is necessary.
var lojaxLawnchairAdapter = new LojaxLawnchair();
// Overriding the 'xhr' property is the key to using it with jQuery.
LojaxRequest.lojaxSettings.xhr = function lawnchairXhrFactory()
{return( new LojaxRequest( lojaxLawnchairAdapter ));};
LojaxRequest.lojaxSettings.username = 'DB_Name';
// The error handler can only be as informative as the Lojax adapter is in its deferred object rejection messages.
function error_handler( jqXHR, status_text, error_thrown )
{
}
var table_name = 'Table_Name';
var url_or_row_key = 'an URL or perhaps a row key';
$.ajax( url_or_row_key )
.done( function get_success( responseData, status_text, jqXHR )
{
	$.ajax( url_or_row_key, 
		$.extend({'password':table_name, 'type':'PUT', 'data':responseData,}, LojaxRequest.lojaxSettings ))
	.done( function insert_success( responseData, status_text, jqXHR )
	{
		$.ajax( url_or_row_key, 
			$.extend({'password':table_name,}, LojaxRequest.lojaxSettings ))
		.done( function select_success( responseData, status_text, jqXHR )
		{
		})
		.fail( error_handler );
	})
	.fail( error_handler );
})
.fail( error_handler );
```

`window.localStorage` or `window.sessionStorage` can be used with the `LojaxLocalStorage` adapter.  Pass 'sessionStorage' as the 'username' to use `sessionStorage` instead of the default `localStorage`.
```javascript
function localStorageXhrFactory()
{return( new LojaxRequest( new LojaxLocalStorage()));}
$.ajax( 'something else', 
	{'contentType':'text', 'xhr':localStorageXhrFactory, 'type':'POST', 'data':"altogether",})
.done( function( responseData, status_text, jqXHR )
{
	$.ajax( 'something else', 
		{'dataType':'text', 'xhr':localStorageXhrFactory,})
	.done( function( responseData, status_text, jqXHR )
	{window.console.log( responseData );})
	.fail( function( jqXHR, status_text, error_thrown )
	{window.console.error( error_thrown );});
})
.fail( function( jqXHR, status_text, error_thrown )
{window.console.error( error_thrown );});
```

The most important things to remember are:

1. HTTP methods (known as `type` in `jQuery.ajax` settings)
  * 'DELETE' is equivalent to 'delete',
  * 'GET' is equivalent to 'select',
  * 'POST' is equivalent to 'update', and
  * 'PUT' is equivalent to 'insert'.
2. The database name is passed via the `username` parameter.
3. The table name is passed via the `password` parameter.
4. If using `jQuery.ajax`, you probably better have `processData` set to `false` (this is the default setting in `LojaxRequest.lojaxSettings`)!
5. If you are storing non-JSON data, you will probably need to specify the submitted data type using `contentType` and/or the expected data type using `dataType` to let the adapter know what (not) to do.

To-Do List:

1. Add query-by-example (QBE) capabilities to use in conjuction with `jQuery.ajax`'s `dataFilter` setting.
