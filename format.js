'use strict';

/*
 * The JSON examples on the test page are not valid JSON.  Initially, I assumed
 * that the service therefore does not consume or produce valid JSON, so I wrote
 * this formatter which would allow me to produce the non-JSON format which was
 * shown in the "Message Format" section of the test page.
 *
 * It turns out that the service does use valid JSON, but the documentation is
 * incorrect.
 *
 * I un-removed this file later as I need it to write JSON anyway, in order to
 * avoid prec
 */

module.exports = format;

function format(fmt, args, replacer) {
	replacer = replacer || JSON.stringify;
	return fmt.replace(/\$(\w+)/g,
		function (match, key) {
			if (args.hasOwnProperty(key)) {
				return replacer(args[key]);
			} else {
				throw new Error('Key not found: "' + key + '"');
			}
		});
}
