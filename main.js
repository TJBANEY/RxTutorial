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

// ^^^^^^^^^^ 'Watch' the response stream for any response events (A, B, C)

responseStream.subscribe(function(response) {
  // render `response` to the DOM however you wish
});

// Create a stream of click events on '<button class="refresh"></button>'

var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

// ----- Click ----- Click ---- 
/*            MAP()          */
/* Turns click events into Requests */
// ------ URL ------- URL -----


// One stream is created on click, and one is created on page load

// var startupRequestStream = Rx.Observable.just('https://api.github.com/users');




/* THIS WILL MERGE THE TWO INTO ONE STREAM */

// -- a --------- b ----- c ----
// ------ A -- B ----- C -------
// -- a - A -- B - b - C - c ---

var requestOnRefreshStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

var startupRequestStream = Rx.Observable.just('https://api.github.com/users');

var requestStream = Rx.Observable.merge(
  requestOnRefreshStream, startupRequestStream
);

// OR THE CLEANER WAY

var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
  .merge(Rx.Observable.just('https://api.github.com/users'));

// EVEN SHORTER

var requestStream = refreshClickStream
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  })
  .startWith('https://api.github.com/users');

// MORE DRY

var requestStream = refreshClickStream.startWith('startup click')
  .map(function() {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });



// Button click stream does can only affect the suggestion UI if we subscribe to it
// Since we are already changing the UI in the response stream subscription, there would
// be two subscriptions which is bad.

var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  });

var suggestion2Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  });

var suggestion3Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  });


var suggestion1Stream = responseStream
  .map(function(listUsers) {
    // get one random user from the list
    return listUsers[Math.floor(Math.random()*listUsers.length)];
  })
  .merge(
    refreshClickStream.map(function(){ return null; })
  );

suggestion1Stream.subscribe(function(suggestion) {
  if (suggestion === null) {
    // hide the first suggestion DOM element
  }
  else {
    // show the first suggestion DOM element
    // and render the data
  }
});

// refreshClickStream: ----------o--------o---->
//     requestStream: -r--------r--------r---->
//    responseStream: ----R---------R------R-->   
// suggestion1Stream: ----s-----N---s----N-s-->
// suggestion2Stream: ----q-----N---q----N-q-->
// suggestion3Stream: ----t-----N---t----N-t-->
