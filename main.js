// The 'Just' operator converts an item into an Observable that emits that item.
var requestStream = Rx.Observable.just('https://api.github.com/users');

// Watch the stream
requestStream.subscribe(function(requestUrl) {
  // execute the request
  $.getJSON(requestUrl, function(responseData) {
    // ...
  });
}

requestStream.subscribe(function(requestUrl) {
  // execute the request
  var responseStream = Rx.Observable.create(function (observer) {
    $.getJSON(requestUrl)
 /*Promise*/   .done(function(response) { observer.onNext(response); })
 /*Promise*/   .fail(function(jqXHR, status, error) { observer.onError(error); })
 /*Promise*/   .always(function() { observer.onCompleted(); });
  });

  // After creating the response stream, watch that stream
  responseStream.subscribe(function(response) {
    // do something with the response
  });
}

/* 	
	Promises can be observeable streams as well
	var stream = Rx.Observable.fromPromise(promise) 
*/