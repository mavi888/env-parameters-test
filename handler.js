'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

function saveNameToTable(name) {
	const item = {};
	item.name = name;

	const params = {
		TableName: 'GreetNames',
		Item: item
	};

	return dynamo.put(params).promise();
}

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}

module.exports.hello = (event, context, callback) => {
	var message = 'Hello World';

	const name = event.queryStringParameters && event.queryStringParameters.name;

	if (name !== null) {
		message = 'Hello ' + name;

		saveNameToTable(name)
			.then(() => {
				sendResponse(200, message, callback);
			})
			.catch(error => {
				console.log(error);
				sendResponse(500, error, callback);
			});
	}
	sendResponse(200, message, callback);
};
