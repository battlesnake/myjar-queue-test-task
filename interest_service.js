'use strict';

/*
 * Uses interest_solver to respond to queries received over AMPQ
 */

var q = require('q');

var amqp = require('./amqp_wrapper');
var interest_solver = require('./interest_solver');
var solution_formatter = require('./interest_solution_formatter');

module.exports = {
	start: start_interest_service
};

function start_interest_service(config) {
	var instructions = [
		/* Connect to the server */
		amqp.connect(config.url),
		/* Get read/write wrappers for queues */
		amqp.get_queues(config.source, config.sink),
		/* Launch the service */
		interest_service
	];
	return instructions.reduce(q.when, null);

	function interest_service(endpoints) {

		/* Bind the mapper to the input socket */
		endpoints.source.readObject(map_data(interest_solver.solve));

		return {
			stop: stop_service
		};

		/* Closes the connection, stopping the service */
		function stop_service() {
			endpoints.close();
		}

		/*
		 * Returns a function which uses the given mapper to transform data from
		 * the input socket and then writes the result to the output socket
		 */
		function map_data(mapper) {
			return curried;

			function curried(data) {
				/* Transform the data */
				var mapped = mapper(data);
				/* Set the token */
				mapped.token = config.token;
				/* Format the result */
				var json = solution_formatter(mapped);
				/* Send the result */
				return endpoints.sink.writeString(json, { contentType: 'application/json' });
			}
		}

	}

}
