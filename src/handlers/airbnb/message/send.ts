import { APIGatewayEvent, Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { Message } from '../../../message/message';

export const send: ProxyHandler = async (event: APIGatewayEvent,
                                         _context: Context,
                                         callback: ProxyCallback) => {
    const message = Message.Singleton;

    console.log('event', event);

    const reqBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    const res = await message.send(reqBody.thread_id, reqBody.message);

    const response = {
        statusCode: res.statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        },
        body: res.body
    };

    callback(null, response);
};