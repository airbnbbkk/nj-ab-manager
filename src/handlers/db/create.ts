import { Callback, Context, Handler } from 'aws-lambda';
import { AWSError } from 'aws-sdk/lib/error';
import * as uuidv1 from 'uuid/v1';
import { Dynamodb } from '../../db/dynamodb';

const dynamoDb = Dynamodb.Singleton.documentClient;

const create: Handler = (event: any, _context: Context, callback: Callback) => {

    const timestamp = new Date().getTime();

    const item = {
        id: event.body.id || uuidv1(),
        createdAt: timestamp,
        updatedAt: timestamp
    };

    if (event.body.data) {
        Object.assign(item, event.body.data);
    }

    const params = {
        TableName: event.body.table,
        Item: item
    };

    console.log('creating item', params);
    dynamoDb.put(params, (error: AWSError) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {'Content-Type': 'text/plain'},
                body: 'Couldn\'t create.'
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: params.Item
        };

        callback(null, response);
    });
};

export { create };
