import { Callback, Context, Handler } from 'aws-lambda';
import { GetItemOutput } from '../../../node_modules/aws-sdk/clients/dynamodb';
import { AWSError } from '../../../node_modules/aws-sdk/lib/error';
import { Dynamodb } from '../../db/dynamodb';

const dynamoDb = Dynamodb.Singleton.db;

const get: Handler = (event: any, _context: Context, callback: Callback) => {
    const params = {
        TableName: event.body.table,
        Key: {
            id: event.body.id
        }
    };

    console.log('getting item', event);
    dynamoDb.get(params, (error: AWSError, result: GetItemOutput) => {
        // handle potential errors
        if (error) {
            console.error('error getting item', error);
            callback(error);
        } else {
            // create a response
            const response = {
                statusCode: 200,
                body: result.Item
            };

            console.log('successfully got data from db', response);
            callback(null, response);
        }
    });
};

export { get };
