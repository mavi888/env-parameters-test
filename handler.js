'use strict';

module.exports.hello = (event, context, callback) => {
	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: 'Hello World'
		})
	};

	callback(null, response);
};
