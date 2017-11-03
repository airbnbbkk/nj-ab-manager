import { APIGatewayEvent, Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { AIRBNB_API, Stage } from '../../../constants';
import { LambdaUtil } from '../../../util/lambda';

const lambdaUtil = LambdaUtil.Singleton;

const send: ProxyHandler = async (event: APIGatewayEvent,
                                  _context: Context,
                                  callback: ProxyCallback) => {
    let response: any;

    console.log(event);

    const reqBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const token = await _getToken();

    if (typeof reqBody.thread_id !== 'object') {
        await _sendRequest(reqBody, token);

    } else {
        reqBody.thread_id.forEach(async (threadId: string) => {
            const newReqBody = {
                thread_id: threadId,
                message: reqBody.message
            };
            await _sendRequest(newReqBody, token);
        });
    }

    response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        },
        body: 'sending messages has requested'
    };

    callback(null, response);
};

const _getToken = async () => {
    const params = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_get_token`,
        InvocationType: 'RequestResponse',
        Payload: ''
    };

    const res = await lambdaUtil.invoke(params);

    return res.body;
};

const _sendRequest = async (reqBody: any, token: string) => {

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
        body: reqBody
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-http_request`,
        InvocationType: 'Event',
        Payload: JSON.stringify(options)
    };

    console.log('invoking sending Airbnb message', params);
    await lambdaUtil.invoke(params);
};

export { send };
