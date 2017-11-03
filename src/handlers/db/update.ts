import { Callback, Context, Handler } from 'aws-lambda';
import { AWSError } from '../../../node_modules/aws-sdk/lib/error';
import { Dynamodb } from '../../db/dynamodb';

const dynamoDb = Dynamodb.Singleton;

const update: Handler = async (event: any, _context: Context, callback: Callback) => {

    const params = _createUpdateParam(event);

    const response = {
        statusCode: 200,
        body: ''
    };

    try {
        const res = await dynamoDb.update(params);
        response.statusCode = (res as AWSError).statusCode || response.statusCode;
        response.body = res;
    } catch (e) {
        console.error('update error', e);
        response.body = JSON.stringify(e, null, 2);
    } finally {
        callback(null, response);
    }
};

const _createUpdateParam = (event: any) => {
    const param = {
        TableName: event.table,
        Key: event.key,
        ExpressionAttributeValues: {} as any,
        UpdateExpression: 'SET',
        /*UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',*/
        ReturnValues: 'NONE'
    };

    Object.keys(event.data).forEach((key: string, i: number, arr: any[]) => {
        param.ExpressionAttributeValues[`:${key}`] = event.data[key];
        param.UpdateExpression += ` ${key} = :${key}${i !== (arr.length - 1) ? ',' : ''}`;
    });

    return param;
};

export { update };
