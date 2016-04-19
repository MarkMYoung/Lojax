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
	QUnit.module( "Lojax with DataFilter" );
	QUnit.asyncTest( "Lawnchair", function( qUnit )
	{
		QUnit.expect( 4 );
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		var lojaxLocalStorageAdapter = new LojaxLocalStorage();
		LojaxRequest.lojaxSettings.processData = false;
		LojaxRequest.lojaxSettings.username = 'Lojax';
		var lawnchairXhrFactory = function()
		{return( new LojaxRequest( lojaxLocalStorageAdapter ));};
		// Please, don't 'stringify' a string!
		var url = "you know what I want";
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		var requestData = {"Results":[{"DocumentId":{"DataSourceId":"10000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000001"},"CropYear":2013,"DocumentType":"Application"},{"DocumentId":{"DataSourceId":"10000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000002"},"CropYear":2014,"DocumentType":"Application"},{"DocumentId":{"DataSourceId":"20000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000003"},"CropYear":2013,"DocumentType":"WorkOrder"},{"DocumentId":{"DataSourceId":"20000000-0000-0000-0000-000000000000","Id":"00000000-0000-0000-0000-000000000004"},"CropYear":2014,"DocumentType":"WorkOrder"}]};
		var lojaxPost = $.extend( true, 
			{'data':requestData, 'method':'POST', 'password':'Testing', 'xhr':lawnchairXhrFactory,}, 
			LojaxRequest.lojaxSettings );
		var $postPromise = $.ajax( url, lojaxPost )
		.done( function( responseData, status_text, jqXHR )
		{qUnit.ok( true, logify( lojaxPost.method, "done", status_text, responseData ));})
		.fail( function( jqXHR, status_text, error_thrown )
		{qUnit.ok( false, logify( lojaxPost.method, "fail", status_text, error_thrown ));});

		$postPromise
		.always( function()
		{
			var lojaxGet = $.extend( true, 
				{
					'method':'GET', 'password':'Testing', 'xhr':lawnchairXhrFactory,
					'whereClause':{'Results':{"subClause":{"CropYear":2014, "DocumentType":"Application"}}},
					'dataFilter':DataFilter.jQueryWhereClauseDataFilter,
				}, 
				LojaxRequest.lojaxSettings );
			$.ajax( url, lojaxGet )
			.done( function( responseData, status_text, jqXHR )
			{
				qUnit.ok( true, logify( lojaxGet.method, "done", status_text, responseData, jqXHR.getAllResponseHeaders()));
				qUnit.strictEqual( responseData.Results.length, 1, "Result length checked." );
				if( responseData.Results.length >= 1 )
				{
					qUnit.deepEqual( responseData.Results[ 0 ], requestData.Results[ 1 ], "Filtering jQuery dataFilter function works." );
				}
				else
				{qUnit.ok( responseData.Results.length >= 1, "Filtered results missing so results not compared." );}
			})
			.fail( function( jqXHR, status_text, error_thrown )
			{
				qUnit.ok( false, logify( lojaxGet.method, "fail 1", status_text, error_thrown ));
				qUnit.ok( false, logify( lojaxGet.method, "fail 2", status_text, error_thrown ));
				qUnit.ok( false, logify( lojaxGet.method, "fail 3", status_text, error_thrown ));
			});
		});
//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
		QUnit.start();
	});
});