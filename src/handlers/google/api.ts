import { APIGatewayEvent, Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { GoogleApi } from '../../google/google';

const call: ProxyHandler = async (event: APIGatewayEvent,
                                  _context: Context,
                                  callback: ProxyCallback) => {

    console.log('event', event);

    const gapi = GoogleApi.Singleton;
    const reqBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    console.log('Calling Google Api', reqBody.name);

    const res = await gapi[reqBody.name](reqBody.param);

    callback(null, res);
};

export { call }