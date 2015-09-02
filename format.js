'use strict';

/*
 * The JSON examples on the test page are not valid JSON.  Initially, I assumed
 * that the service therefore does not consume or produce valid JSON, so I wrote
 * this formatter which would allow me to produce the non-JSON format which was
 * shown in the "Message Format" section of the test page.
 *
 * It turns out that the service does use valid JSON, but the documentation is
 * incorrect.
 */

module.exports = format;

if (!module.parent) {
	run_test();
}

function format(fmt, args) {
	return fmt.replace(/\$(\w+)/g,
		function (match, key) {
			if (args.hasOwnProperty(key)) {
				return JSON.stringify(args[key]);
			} else {
				throw new Error('Key not found: "' + key + '"');
			}
		});
}

function run_test() {
	var assert = require('assert');

	var fmt = '{ sum: $sum, days: $days, interest: $interest, totalSum: $totalSum, token: $token }';

	var args = {
		sum: 123,
		days: 5,
		interest: 18.45,
		totalSum: 141.45,
		token: 'myIdentifier'
	};

	var example = '{ sum: 123, days: 5, interest: 18.45, totalSum: 141.45, token: "myIdentifier" }';

	assert.equal(format(fmt, args), example, 'Only test');
}
