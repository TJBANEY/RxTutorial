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

var responseMetastream = requestStream
  .map(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });

// Map takes an emmited value, and passes it through a function
// Meta Stream = A stream of 'pointers' to other streams

/* Flat Map is a way to 'flatten' a metastream, back into a simple stream */

var responseStream = requestStream
  .flatMap(function(requestUrl) {
    return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
  });

// With many url requests happening, this way we will get all the corresponding events 
// from those requests in the flatmap stream

// ---- a ---- b ---- c ----------- <= Request events happening on requestStream
// -------- A ---- B ------ C ----- <= Response events happening on flattened responseStream

