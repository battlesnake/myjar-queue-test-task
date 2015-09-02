'use strict';


/* Precision for calculations */
var precision = 100;

/* Rounding to use */
var do_round = Math.round;

module.exports = {
	solve: solve
};

if (!module.parent) {
	run_test();
}

/*
 * Daily interest:
 *                   ╭────╮
 *                   │ 1% → !(day%3) && day%5
 *                   │    │
 *                   │ 2% → day%3 && !(day%5)
 *   interest(day) = ┤    │
 *                   │ 3% → !(day%3) && !(day%3)
 *                   │    │
 *                   │ 4% → day%3 && day%5
 *                   ╰────╯
 *
 * Daily interest amount is periodic over 15-day period:
 *
 * ┌──────────┬───────────────────────────────┐
 * │      day │ 1 2 3 4 5 6 7 8 9 a b c d e f │
 * ├──────────┼───────────────────────────────┤
 * │ interest │ 4 4 1 4 2 1 4 4 1 2 4 1 4 4 3 │
 * └──────────┴───────────────────────────────┘
 *
 * As interest is summed daily (not compounded), the interest
 * accumulated over the first 15 days is the same as that of the next 15
 * days (and so forth).  This allows us to do a little optimization for
 * large numbers of days, although I haven't implemented it yet.
 * Here's a draft of it:
 *
 * function growth(sum, days) {
 *   const growth_on_day = [4, 4, ...].map(function (rate) {
 *     return do_round(sum * rate/100);
 *   });
 *   const growth_to_day = [1, 2, ..., 15]
 *     .map(function (day) {
 *       var seq = growth_on_day.slice(0, day)
 *         .reduce(function (total, val) {
 *           return total + val;
 *         });
 *     });
 *   const growth_per_block = growth_to_day[15];
 *   var blocks = ⌊days/15⌋, remaining = days%15
 *   return growth_per_block * blocks * growth_to_day[remaining];
 * }
 *
 */
function solve(data) {
	var sum = data.sum * precision;
	var days = data.days;

	var interest = 0;
	for (var day = 1; day <= days; day++) {
		var div3 = (day % 3) === 0;
		var div5 = (day % 5) === 0;
		var rate = div3 ? (div5 ? 3 : 1) : (div5 ? 2 : 4);
		interest += do_round(sum * (rate / 100));
	}

	var totalSum = sum + interest;

	return {
		sum: sum / precision,
		days: days,
		interest: interest / precision,
		totalSum: totalSum / precision
	};
}


function run_test() {
	var assert = require('assert');
	var tests = [
		[{ sum: 123, days: 5 }, { interest: 18.45, totalSum: 141.45 }],
		[{ sum: 687, days: 3 }, { interest: 61.83, totalSum: 748.83 }],
		[{ sum: 213, days: 25 }, { interest: 149.1, totalSum: 362.1 }]
	];
	tests.forEach(function (this_test, idx) {
		assert(validate_result.apply(null, this_test), "Test #" + (idx + 1) + " failed");
	});
}

function validate_result(query, expect) {
	expect = expect || query;
	var actual = solve(query);
	return actual.interest === expect.interest && actual.totalSum === expect.totalSum;
}
