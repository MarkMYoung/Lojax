$(document).ready( function()
{
	function logify()
	{
		var line = Array.prototype.slice.apply( arguments )
			.map( function( argument, a )
			{return((typeof( argument ) === 'object')?(JSON.stringify( argument )):(argument));})
			.join( ' ' );
		return( line );
	}
	QUnit.module( "Lojax" );
	QUnit.asyncTest( "Lawnchair", function( qUnit )
	{
		QUnit.expect( 4 );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		var lojaxLawnchairAdapter = new LojaxLawnchair();
		LojaxRequest.lojaxSettings.processData = false;
		//LojaxRequest.lojaxSettings.username = 'Lojax';
		var lawnchairXhrFactory = function()
		{return( new LojaxRequest( lojaxLawnchairAdapter ));};
		// Please, don't 'stringify' a string!
		var url = "you know what I want";
		var requestData = {"Results":[{"DocumentId":{"DataSourceId":"10000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000001"},"CropYear":2013,"DocumentType":"Application"},{"DocumentId":{"DataSourceId":"10000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000002"},"CropYear":2014,"DocumentType":"Application"},{"DocumentId":{"DataSourceId":"20000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000003"},"CropYear":2013,"DocumentType":"WorkOrder"},{"DocumentId":{"DataSourceId":"20000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000004"},"CropYear":2014,"DocumentType":"WorkOrder"}]};
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		function delete_data()
		{
			var lojaxDelete = $.extend( true, 
				{'method':'DELETE', 'username':'Lojax', 'password':'Testing', 'xhr':lawnchairXhrFactory,}, 
				LojaxRequest.lojaxSettings );
			var $deletePromise = $.ajax( url, lojaxDelete )
			.done( function( responseData, status_text, jqXHR )
			{qUnit.ok( true, logify( this.method, "deletion success", status_text, responseData, jqXHR.getAllResponseHeaders()));})
			.fail( function( jqXHR, status_text, error_thrown )
			{qUnit.ok( false, logify( this.method, "deletion failure", status_text, error_thrown ));})
			return( $deletePromise );
		}
		function get_data()
		{
			var lojaxGet = $.extend( true, 
				{'method':'GET', 'username':'Lojax', 'password':'Testing', 'xhr':lawnchairXhrFactory,}, 
				LojaxRequest.lojaxSettings );
			var $getPromise = $.ajax( url, lojaxGet )
			.done( function( responseData, status_text, jqXHR )
			{qUnit.ok( true, logify( this.method, "selection success", status_text, responseData, jqXHR.getAllResponseHeaders()));})
			.fail( function( jqXHR, status_text, error_thrown )
			{qUnit.ok( false, logify( this.method, "selection failure", status_text, error_thrown ));})
			return( $getPromise );
		}
		function not_found_data()
		{
			var lojaxGetNotFound = $.extend( true, 
				{'method':'GET', 'username':'Lojax', 'password':'Testing', 'xhr':lawnchairXhrFactory,}, 
				LojaxRequest.lojaxSettings );
			var $notFoundPromise = $.ajax( url, lojaxGetNotFound )
			.done( function( responseData, status_text, jqXHR )
			{qUnit.ok( false, logify( this.method, "should not succeed", status_text, responseData, jqXHR.getAllResponseHeaders()));})
			.fail( function( jqXHR, status_text, error_thrown )
			{qUnit.ok( true, logify( this.method, "should fail", status_text, error_thrown ));})
			return( $notFoundPromise );
		}
		function put_or_post_data()
		{
			var lojaxPutOrPost = $.extend( true, 
				{'data':requestData, 'method':'PUT', 'username':'Lojax', 'password':'Testing', 'xhr':lawnchairXhrFactory,}, 
				LojaxRequest.lojaxSettings );
			var $putOrPostPromise = $.ajax( url, lojaxPutOrPost )
			.done( function( responseData, status_text, jqXHR )
			{qUnit.ok( true, logify( this.method, "insertion success", status_text, responseData, jqXHR.getAllResponseHeaders()));})
			.fail( function( jqXHR, status_text, error_thrown )
			{qUnit.ok( false, logify( this.method, "insertion failure", status_text, error_thrown ));})
			return( $putOrPostPromise );
		}
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		put_or_post_data()
		.then( get_data )
		.then( delete_data )
		.then( not_found_data )
		.always( QUnit.start );
	});
	QUnit.asyncTest( "LocalStorage", function( qUnit )
	{
		QUnit.expect( 4 );
		QUnit.start();
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		var lojaxLocalStorageAdapter = new LojaxLocalStorage();
		var localStorageXhrFactory = function()
		{return( new LojaxRequest( lojaxLocalStorageAdapter ));};
		var lojaxLocalPost = $.extend( true, 
			{'data':{"I am":"an object"}, 'type':'POST', 'xhr':localStorageXhrFactory,}, 
			LojaxRequest.lojaxSettings );
		var $localPostPromise = $.ajax( 'test', lojaxLocalPost )
		.done( function( responseData, status_text, jqXHR )
		{qUnit.ok( true, logify( this.method, "done", status_text, responseData ));})
		.fail( function( jqXHR, status_text, error_thrown )
		{qUnit.ok( false, logify( this.method, "fail", status_text, error_thrown ));});

		var lojaxLocalDelete = $.extend( true, 
			{'data':{"I am":"an object"}, 'type':'DELETE', 'xhr':localStorageXhrFactory,}, 
			LojaxRequest.lojaxSettings );
		var $localPostPromise = $.ajax( 'test', lojaxLocalDelete )
		.done( function( responseData, status_text, jqXHR )
		{ok( true, logify( this.method, "done", status_text, responseData ));})
		.fail( function( jqXHR, status_text, error_thrown )
		{ok( false, logify( this.method, "fail", status_text, error_thrown ));});

		var lojaxSessionPut = $.extend( true, 
			{'data':{"I am":"an object"}, 'type':'PUT', 'username':'sessionStorage', 'xhr':localStorageXhrFactory,}, 
			LojaxRequest.lojaxSettings );
		var $sessionPostPromise = $.ajax( 'test', lojaxSessionPut )
		.done( function( responseData, status_text, jqXHR )
		{qUnit.ok( true, logify( this.method, "done", status_text, responseData ));})
		.fail( function( jqXHR, status_text, error_thrown )
		{qUnit.ok( false, logify( this.method, "fail", status_text, error_thrown ));});

		var lojaxSessionDelete = $.extend( true, 
			{'data':{"I am":"an object"}, 'type':'DELETE', 'username':'sessionStorage', 'xhr':localStorageXhrFactory,}, 
			LojaxRequest.lojaxSettings );
		var $sessionPostPromise = $.ajax( 'test', lojaxSessionDelete )
		.done( function( responseData, status_text, jqXHR )
		{qUnit.ok( true, logify( this.method, "done", status_text, responseData ));})
		.fail( function( jqXHR, status_text, error_thrown )
		{qUnit.ok( false, logify( this.method, "fail", status_text, error_thrown ));});
	});
});