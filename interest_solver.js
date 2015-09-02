'use strict';

/*
 * Solves the interest calculations
 */

/* Precision for calculations */
var precision = 100;

/* Rounding to use */
var do_round = Math.round;

module.exports = {
	solve: solve_wrap(solve_optim)
//	solve: solve_wrap(solve_naïve)
};

/* Wrap a solver for export */
function solve_wrap(solver) {
	return function (data) {
		var sum = data.sum;
		var days = data.days;

		if (!(sum > 0 && days > 0) || sum === Infinity || days === Infinity) {
			throw new RangeError('Invalid input (underflow)');
		}

		var interest = solver(sum * precision, days) / precision;

		return {
			sum: sum,
			days: days,
			interest: interest,
			totalSum: sum + interest
		};
	};
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
 */
function solve_naïve(sum, days) {
	/*
	 * Iterates over each day, calculating interest per day.
	 *
	 * O(N) time
	 * O(1) space
	 */
	var interest = 0;
	for (var day = 1; day <= days; day++) {
		var div3 = (day % 3) === 0;
		var div5 = (day % 5) === 0;
		var rate = div3 ? (div5 ? 3 : 1) : (div5 ? 2 : 4);
		interest += do_round(sum * (rate / 100));
	}
	return interest;
}

/*
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
 * large numbers of days.
 *
 * We pre-calculate the interest accumulated over a 15-day block, then calculate
 * how many 15-day blocks there are.  For the remaining <15 days, we could use
 * the naïve solver, but we have already calculated the required value while we
 * calculated the value for a 15-day block.  Dynamic programming FTW
 *
 * O(1) time
 * O(1) space
 */
function solve_optim(sum, days) {
	/* Growth on each day (%) */
	var growth_on_day_percent = [4, 4, 1, 4, 2, 1, 4, 4, 1, 2, 4, 1, 4, 4, 3];
	/* Repetition period of growth series */
	var period = growth_on_day_percent.length;
	/* For less than one period, the naïve solver will be quicker */
	if (days < period) {
		return solve_naïve(sum, days);
	}
	/* Interest added for each day in the period */
	var growth_on_day = growth_on_day_percent
		.map(function (rate) { return do_round(sum * rate/100); });
	/* Accumulated interest up to each day of the first period */
	var growth_to_day = growth_on_day
		.map(function (x, i) {
			return growth_on_day.slice(0, i + 1)
				.reduce(function (total, value) { return total + value; }, 0);
		});
	/* Zero'th day: no interest */
	growth_to_day.unshift(0);
	/* Growth per period */
	var growth_per_period = growth_to_day[period];
	/* Number of complete periods */
	var periods = Math.floor(days / period);
	/* Number of remaining days after subtracting complete periods away */
	var remaining = days % period;
	/* Solution */
	return growth_per_period * periods + growth_to_day[remaining];
}
