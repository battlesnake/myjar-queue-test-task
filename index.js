'use strict';

var q = require('q');

var config = require('./config');
var interest_service = require('./interest_service');

interest_service.start(config)
	.then(function (service) {
		console.log('Interest service started');
	})
	.catch(function (error) {
		console.error('Interest service failed: ', error);
		console.error('Stack trace:\n', error.stack);
	});
