import { Callback, Context, Handler } from 'aws-lambda';
import { Dynamodb } from '../../db/dynamodb';

const dynamoDb = Dynamodb.Singleton;

const get: Handler = async (event: any, _context: Context, callback: Callback) => {
    const params = {
        TableName: event.body.table,
        Key: {
            id: event.body.id
        }
    };

    console.log('getting item', event);
    const res = await dynamoDb.get(params);

    const response = {
        statusCode: 200,
        body: res.Item
    };

    callback(null, response);
};

export { get };
