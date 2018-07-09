'use strict';

module.exports.hello = (event, context, callback) => {
	var message = 'Hello World';

	const name = event.queryStringParameters && event.queryStringParameters.name;

	if (name !== null) {
		message = 'Hello ' + event.queryStringParameters.name;
	}

	const response = {
		statusCode: 200,
		body: JSON.stringify({
			message: message
		})
	};

	callback(null, response);
};
