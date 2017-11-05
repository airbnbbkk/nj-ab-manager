import { APIGatewayEvent, Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { AIRBNB_API } from '../../../constants';

const airbnb = Airbnb.Singleton;
export const send: ProxyHandler = async (event: APIGatewayEvent,
                                         _context: Context,
                                         callback: ProxyCallback) => {
    let response: any;

    console.log('event', event);

    const reqBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    if (typeof reqBody.thread_id !== 'object') {
        await _sendRequest(reqBody);

    } else {
        reqBody.thread_id.forEach(async (threadId: string) => {
            const newReqBody = {
                thread_id: threadId,
                message: reqBody.message
            };
            await _sendRequest(newReqBody);
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

const _sendRequest = async (reqBody: any) => {
    const options = {
        method: 'POST',
        host: AIRBNB_API.ENDPOINTS.HOST,
        path: AIRBNB_API.ENDPOINTS.MESSAGE_PATH,
        body: reqBody
    };

    airbnb.request(options);
};

export = send;
