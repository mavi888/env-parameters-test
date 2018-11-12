'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const middy = require('middy');
const { ssm } = require('middy/middlewares');

const TABLE_NAME = process.env.NAMES_DYNAMODB_TABLE;
const STAGE = process.env.STAGE;

function saveNameToTable(name) {
	const item = {};
	item.name = name;

	const params = {
		TableName: TABLE_NAME,
		Item: item
	};

	return dynamo.put(params).promise();
}

function getNameFromTable(name) {
	const params = {
		Key: {
			name: name
		},
		TableName: TABLE_NAME
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

const hello = middy((event, context, callback) => {
	const parameter = context.value1;

	var message = `Hello World at ${parameter}`;

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
});

module.exports.hello = middy(hello).use(
	ssm({
		cache: true,
		cacheExpiryInMillis: 1 * 60 * 1000, // 1 mins
		setToContext: true,
		names: {
			value1: `/env-parameters-test/${STAGE}/value1`
		}
	})
);

const wasGreeted = middy((event, context, callback) => {
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
});

module.exports.wasGreeted = middy(wasGreeted).use(
	ssm({
		cache: true,
		cacheExpiryInMillis: 1 * 60 * 1000, // 1 mins
		setToContext: true,
		names: {
			value1: `/env-parameters-test/${STAGE}/value1`
		}
	})
);
