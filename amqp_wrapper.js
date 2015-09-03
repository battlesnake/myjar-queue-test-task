'use strict';

/*
 * Wraps the AMQP library in a very simple interface
 *
 * Public functions are all curry wrappers, to facilitate usage in promise
 * chains.
 *
 * Example usage: see interest_service.js
 */

var q = require('q');
var amqplib = require('amqplib');
var assign = require('lodash.assign');

module.exports = {
	connect: connect,
	get_queues: get_queues
};

/* Connect to a RabbitMQ server */
function connect(url) {

	return curried;

	function curried() {
		return amqplib.connect(url);
	}
}

/* Get a readable and a writable socket */
function get_queues(source_queue, sink_queue) {

	return curried;

	function curried(connection) {
		return connection.createConfirmChannel()
			.then(function (channel) {
				var bindings = [
					bind_source(channel, source_queue),
					bind_sink(channel, sink_queue)
				];
				return q.spread(bindings, function (source, sink) {
					return {
						connection: connection,
						source: source,
						sink: sink,
						close: do_close
					};
				});
			});

		function do_close() {
			connection.close();
		}
	}
}

/* Get readable socket */
function bind_source(channel, queue) {
	return q.resolve()
		.then(function () {
			return channel.checkQueue(queue);
		})
		.then(function () {
			return {
				readObject: readObject,
				readString: readString,
				readBuffer: readBuffer
			};

			function readObject(callback) {
				return readString(function (str) {
					var obj = JSON.parse(str);
					return callback(obj);
				});
			}

			function readString(callback) {
				return readBuffer(function (buffer) {
					var str = buffer.toString();
					return callback(str);
				});
			}

			function readBuffer(callback) {
				var deferred = q.defer();
				channel.consume(queue, function (msg) {
					if (msg === null) {
						deferred.reject(null);
						return;
					}
					return q.nfcall(callback, msg.content)
						.then(function () {
							channel.ack(msg);
							deferred.resolve();
						}, function (error) {
							channel.nack(msg);
							deferred.reject(error);
						});
				});
				return deferred.promise;
			}
		});
}

/* Get writable socket */
function bind_sink(channel, queue) {
	return q.resolve()
		.then(function () {
			return channel.checkQueue(queue);
		})
		.then(function () {
			return {
				writeObject: writeObject,
				writeString: writeString,
				writeBuffer: writeBuffer
			};

			function writeObject(data, options) {
				var json = JSON.stringify(data);
				options = assign({ contentType: 'application/json' }, options);
				return writeString(json, options);
			}

			function writeString(data, options) {
				var buffer = new Buffer(data);
				options = assign({ contentType: 'text/plain' }, options);
				return writeBuffer(buffer, options);
			}

			function writeBuffer(data, options) {
				var deferred = q.defer();
				channel.sendToQueue(queue, data, options, function (error) {
					if (error) {
						deferred.reject(error);
					} else {
						deferred.resolve();
					}
				});
				return deferred.promise;
			}
		});
}
