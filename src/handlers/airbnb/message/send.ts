import { APIGatewayEvent, Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import * as Lambda from 'aws-sdk/clients/lambda';
import { AIRBNB_API, Stage } from '../../../constants';
import { LambdaUtil } from '../../../util/lambda';

const lambdaUtil = new LambdaUtil();
const lambda = new Lambda();

const send: ProxyHandler = async (event: APIGatewayEvent,
                                  _context: Context,
                                  callback: ProxyCallback) => {
    let response: any;
    let resBody: any;

    const reqBody = JSON.parse(event.body);

    console.log(event, _context);

    const body = {
        thread_id: reqBody.thread_id,
        message: reqBody.message
    };

    const token = await _getToken();

    const options = {
        method: 'POST',
        host: AIRBNB_API.ENDPOINTS.HOST,
        path: AIRBNB_API.ENDPOINTS.MESSAGE_PATH,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
            'X-Airbnb-OAuth-Token': token
        },
        body
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-http_request`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(options)
    };

    console.log('sending Airbnb message', params);
    await lambda.invoke(params)
        .promise()
        .then(res => {
            response = lambdaUtil.convertInvocationResToLambdaRes(res);
            console.log('Airbnb message sent', response);
            resBody = response;
        })
        .catch(err => {
            console.error('sending Airbnb message failed', err);
        });

    response = {
        statusCode: resBody.error_code || 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        },
        body: JSON.stringify(resBody)
    };

    callback(null, response);
};

const _getToken = async () => {
    const params = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_get_token`,
        InvocationType: 'RequestResponse',
        Payload: ''
    };

    return await lambda.invoke(params).promise()
        .then(res => {
            const response = lambdaUtil.convertInvocationResToLambdaRes(res);

            return response.body;
        })
        .catch(err => {
            console.error('failed to get token', err);
            return err;
        });
};

export { send };
