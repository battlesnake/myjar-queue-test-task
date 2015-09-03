'use strict';

/*
 * Manually write JSON to avoid precision errors with floats
 */

var format = require('./format');

var template = '{ "sum": $sum, "days": $days, "interest": $interest, "totalSum": $totalSum, "token": $token }';

module.exports = formatter;

function formatter(solution) {
	return format(template, solution, function (value) {
		if (typeof value === 'number') {
			if (value === Math.floor(value)) {
				return value.toFixed(0);
			} else {
				return value.toFixed(2);
			}
		} else {
			return JSON.stringify(value);
		}
	});
}
