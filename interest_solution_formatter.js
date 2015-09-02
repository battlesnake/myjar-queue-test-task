'use strict';

var format = require('./format');

var fmt = '{ "sum": $sum, "days": $days, "interest": $interest, "totalSum": $totalSum, "token": $token }';

module.exports = formatter;

/* Manually write JSON to avoid precision errors with floats */
function formatter(solution) {
	return format(fmt, solution, function (value) {
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
