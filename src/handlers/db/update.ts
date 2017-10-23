import { Callback, Context, Handler } from 'aws-lambda';
import { AWSError } from 'aws-sdk/lib/error';
import { Dynamodb } from '../../db/dynamodb';

const dynamoDb = Dynamodb.Singleton.documentClient;

const update: Handler = (event: any, _context: Context, callback: Callback) => {
    const timestamp = new Date().getTime();

    /*const params = {
        TableName: 'todos',
        Item: {
            id: event.pathParameters.id,
            text: data.text,
            checked: data.checked,
            updatedAt: timestamp,
        },
    };*/

    const item = {
        id: event.body.id,
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

    console.log('updating item', params);
    dynamoDb.put(params, (error: AWSError) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(error);
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

export { update };
