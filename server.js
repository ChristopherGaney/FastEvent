'use strict';

var util = require('util');
var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var moment = require('moment');
var app = express();
var PageApp = require('./public/PageApp.js');
var router = require('./user/api');
var User = require('./models/user');
var Event = require('./models/event');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var sanitizeHtml = require('sanitize-html');
var mongoose = require('mongoose');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var MongoStore = require('connect-mongo')(expressSession);
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var testedUrl = 'mongodb://Your_db_uri';
MongoClient.connect(testedUrl, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});

mongoose.connect('mongodb://Your_db_uri');
var db = mongoose.connection;

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var ReactRouter = require('react-router');
var match = ReactRouter.match;
var RouterContext = React.createFactory(ReactRouter.RouterContext);
var Provider = React.createFactory(require('react-redux').Provider);
var routes = require('./public/routes.js').routes
var reduxStore = require('./public/redux-store');

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug'); 
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(expressValidator());
app.use(expressSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());	
app.use(passport.session());

app.use(express.static(__dirname +'/public'));
app.use(router);

app.use(function (req, res, next) {
	if(req.url === '/' || req.url === '/sign-in' || req.url === '/sign-up') {
		
		var initialState = {
				fetching_data: {message: 'loading...'},
				mainEvent: {mainEvent: {}}
			};
			
		var store = reduxStore.configureStore(initialState);
		
		match({routes: routes, location: req.url}, function(error, redirectLocation, renderProps) {
			  if (error) {
				res.status(500).send(error.message)
			  } else if (redirectLocation) {
				res.redirect(302, redirectLocation.pathname + redirectLocation.search)
			  } else if (renderProps) {
				  var html = ReactDOMServer.renderToString(Provider({store: store}, RouterContext(renderProps)));
				  return res.render('index', { content: html });
			  } else {
				res.status(404).send('Not found')
			  }
		});
	}
	else {
		next();
	}
  });

app.use(function (req, res, next) {
	if(req.url === '/user/events') {
		if (req.isAuthenticated()) {
			Event.getEventsById(req.user.id, function(err, events) {
				var initialState = {
					fetching_data: {message: 'fetching data...'},
					events: {events: events}
				};
			
				var store = reduxStore.configureStore(initialState);
				
				match({routes: routes, location: req.url}, function(error, redirectLocation, renderProps) {
				  if (error) {
					res.status(500).send(error.message)
				  } else if (redirectLocation) {
					res.redirect(302, redirectLocation.pathname + redirectLocation.search)
				  } else if (renderProps) {
					   var html = ReactDOMServer.renderToString(Provider({store: store}, RouterContext(renderProps)));
						return res.render('index', { content: html });
				  } else {
					res.status(404).send('Not found')
				  }
			});
	
			});
		}
		else {
			res.redirect('/sign-in');
		}
	}
	else {
		next();
	}
});

app.use(function (req, res, next) {
	var _id = '';
	if(req.url === '/user/view') {
		if (req.isAuthenticated()) {
			_id = req.session.event_id;
			Event.getOneEventById(_id, function(err, event) {
				if(event) {
					event.eventdoc = decodeURIComponent(event.eventdoc);
					}
				Event.getEventsById(req.user.id, function(err, events) {
					
					var initialState = {
						fetching_data: {message: 'fetching data...'},
						mainEvent: {mainEvent: event},
						events: {events: events}
					};
					var store = reduxStore.configureStore(initialState);
					
					  match({routes: routes, location: req.url}, function(error, redirectLocation, renderProps) {
					  if (error) {
						res.status(500).send(error.message)
					  } else if (redirectLocation) {
						res.redirect(302, redirectLocation.pathname + redirectLocation.search)
					  } else if (renderProps) {
						 var html = ReactDOMServer.renderToString(Provider({store: store}, RouterContext(renderProps)));
						return res.render('index', { content: html });
					  } else {
						res.status(404).send('Not found')
					  }
				});  
			});
			}); 
		}
		else {
			res.redirect('/sign-in');
		}
	}
	else {
		next();
	}
});

app.use(function (req, res, next) {
	var _id = '';
	if(req.url === '/user/edit') {
		if (req.isAuthenticated()) {
			_id = req.session.event_id;
			Event.getOneEventById(_id, function(err, event) {
				if(event) {
					event.eventdoc = decodeURIComponent(event.eventdoc);
				}
				Event.getEventsById(req.user.id, function(err, events) {
					
					var initialState = {
						fetching_data: {message: 'fetching data...'},
						mainEvent: {mainEvent: event},
						events: {events: events}
					};
				
					var store = reduxStore.configureStore(initialState);
					
					match({routes: routes, location: req.url}, function(error, redirectLocation, renderProps) {
					  if (error) {
						res.status(500).send(error.message)
					  } else if (redirectLocation) {
						res.redirect(302, redirectLocation.pathname + redirectLocation.search)
					  } else if (renderProps) {
						 var html = ReactDOMServer.renderToString(Provider({store: store}, RouterContext(renderProps)));
						return res.render('index', { content: html });
					  } else {
						res.status(404).send('Not found')
					  }
				});  
			});  
			});
		}
		else {
			res.redirect('/sign-in');
		}
	}
	else {
		next();
	}
});


app.use(function (req, res, next) {
	
	if(req.url === '/user/create') {
		if(req.isAuthenticated()) {
			
			Event.getEventsById(req.user.id, function(err, events) {
				var initialState = {
					fetching_data: {message: 'loading...'},
					events: {events: events},
					mainEvent: {mainEvent: {}}
				};
					
				var store = reduxStore.configureStore(initialState);
						
				 match({routes: routes, location: req.url}, function(error, redirectLocation, renderProps) {
					  if (error) {
						res.status(500).send(error.message)
					  } else if (redirectLocation) {
						res.redirect(302, redirectLocation.pathname + redirectLocation.search)
					  } else if (renderProps) {
						var html = ReactDOMServer.renderToString(Provider({store: store}, RouterContext(renderProps)));
						return res.render('index', { content: html });
					  } else {
						res.status(404).send('Not found')
					  }
				});
		  });  
		}
		else {
			res.redirect('/sign-in');
		}
	}
	else {
		next();
	}
});

// This function returns the public page requested in url
app.use(function (req, res, next) {
		var graburl = req.url.substring(1);
		var eventurl = '';
		if(typeof graburl === 'string') {
			graburl = graburl.replace(/&gt;/gi, '>');
			graburl = graburl.replace(/&lt;/gi, '<');
			graburl = graburl.replace(/(&copy;|&quot;|&amp;)/gi, '');
			graburl = graburl.replace('$', '');
			eventurl = sanitizeHtml(graburl, {
				allowedTags: [],
				allowedAttributes: []
				});
			 var errors = req.validationErrors();
			  if (errors) {
				res.render('404');
				return;
			  }
		}
		else {
			res.render('404');
		}
		Event.getEventByEventUrl(eventurl, function(err, event) {
			var date = "";
			var message = "";
			if(event) {
				if(event.enddate === "") {
					date = moment(event.startdate, "MM-DD-YYYY");
					message = moment().isBefore(date, 'date') ?
						"" : "This Event Has Already Happened" ;
					}
				else {
					date = moment(event.enddate, "MM-DD-YYYY");
					message = moment().isBefore(date, 'date') ?
						"" : "This Event Has Already Happened" ;
					}
				var initialState = {
					fetching_data: {message: message },
					mainEvent: {mainEvent: event }
				};
					
				var store = reduxStore.configureStore(initialState);
						
				 match({routes: routes, location: req.url}, function(error, redirectLocation, renderProps) {
					  if (error) {
						res.status(500).send(error.message)
					  } else if (redirectLocation) {
						res.redirect(302, redirectLocation.pathname + redirectLocation.search)
					  } else if (renderProps) {
						var html = ReactDOMServer.renderToString(Provider({store: store}, RouterContext(renderProps)));
						return res.render('page', { content: html });
					  } else {
						res.status(404).render('404')
					  }
					});		  
			}
		  else {
				res.render('404');
			}
		});
});

  
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
    });
}

var port = process.env.PORT || 3000;

app.listen(port,function(){
	console.log("Listening on: " + port);
	});





