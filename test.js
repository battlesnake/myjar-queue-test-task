'use strict';

var assert = require('assert');

test_interest_solver();
test_solution_formatter();

function test_interest_solver() {
	var solver = require('./interest_solver');

	function run_test() {
		var tests = [
			[{ sum: 123, days: 5 }, { interest: 18.45, totalSum: 141.45 }],
			[{ sum: 687, days: 3 }, { interest: 61.83, totalSum: 748.83 }],
			[{ sum: 213, days: 25 }, { interest: 149.1, totalSum: 362.1 }],
			[{ sum: 591, days: 14 }, { interest: 236.4, totalSum: 827.4 }],
			[{ sum: 809, days: 15 }, { interest: 347.87, totalSum: 1156.87 }],
			[{ sum: 496, days: 28 }, { interest: 391.84, totalSum: 887.84 }],
			[{ sum: 574, days: 29 }, { interest: 476.42, totalSum: 1050.42 }],
			[{ sum: 45, days: 1 }, { interest: 1.8, totalSum: 46.8 }],
			[{ sum: 697, days: 3 }, { interest: 62.73, totalSum: 759.73 }],
			[{ sum: 0, days: 9999 }, { interest: 0, totalSum: 0 }],
		];
		tests.forEach(function (this_test, idx) {
			assert(validate_result.apply(null, this_test), "Test #" + (idx + 1) + " failed");
		});
	}

	function validate_result(query, expect) {
		expect = expect || query;
		var actual = solver.solve(query);
		return actual.interest === expect.interest && actual.totalSum === expect.totalSum;
	}

}

function test_solution_formatter() {
	var solution_formatter = require('./interest_solution_formatter');

	var args = {
		sum: 123,
		days: 5,
		interest: 18.45,
		totalSum: 141.45,
		token: 'myIdentifier'
	};

	var example = '{ "sum": 123, "days": 5, "interest": 18.45, "totalSum": 141.45, "token": "myIdentifier" }';

	assert.equal(solution_formatter(args), example, 'Solution formatter');
}
