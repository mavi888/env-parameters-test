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

function getNameFromTable(name) {
	const params = {
		Key: {
			name: name
		},
		TableName: 'GreetNames'
	};

	return dynamo
		.get(params)
		.promise()
		.then(response => {
			return response.Item;
		});
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

module.exports.wasGreeted = (event, context, callback) => {
	const name = event.queryStringParameters && event.queryStringParameters.name;

	if (name !== null) {
		getNameFromTable(name)
			.then(returnedName => {
				if (returnedName !== undefined) {
					sendResponse(200, 'YES', callback);
				} else {
					sendResponse(200, 'NO', callback);
				}
			})
			.catch(error => {
				sendResponse(500, error, callback);
			});
	} else {
		sendResponse(400, 'Define a name to query', callback);
	}
};
