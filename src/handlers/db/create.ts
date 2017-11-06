import { Handler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { AWSError } from 'aws-sdk/lib/error';
import { Dynamodb } from '../../db/dynamodb';
import BatchWriteItemInput = DocumentClient.BatchWriteItemInput;
import PutItemInput = DocumentClient.PutItemInput;

const dynamoDb: Dynamodb = Dynamodb.Singleton;

const create: Handler = async (event, _context, callback) => {

    let body: Dict;
    let params: any;
    let dbWriter: (params: PutItemInput | BatchWriteItemInput) =>
        Promise<DocumentClient.PutItemOutput | DocumentClient.BatchWriteItemOutput | AWSError>;

    if (typeof event.body === 'string') {
        body = JSON.parse(event.body);
    } else {
        body = event.body;
    }

    if (body.data.constructor.name === 'Array') {
        dbWriter = dynamoDb.batchWrite.bind(dynamoDb);
        params = {
            RequestItems: {
                [body.table]: body.data
            }
        };
    } else {
        dbWriter = dynamoDb.put.bind(dynamoDb);
        params = {
            TableName: body.table,
            Item: body.data
        };
    }

    const response = {
        statusCode: 200,
        body: ''
    };

    try {
        const res = await dbWriter(params);
        response.statusCode = (res as AWSError).statusCode || response.statusCode;
        response.body = JSON.stringify(res, null, 2);
    } catch (e) {
        console.error('batch error', e);
        response.body = JSON.stringify(e, null, 2);
    } finally {
        callback(null, response);
    }
};

export { create };
