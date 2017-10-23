import { Callback, Context, Handler } from 'aws-lambda';
import * as rq from '../../../node_modules/minimal-request-promise';

const request: Handler = async (event: any, _context: Context, callback: Callback) => {
    console.log('event', event);
    let response: object = {};

    const options = {
        method: event.method,
        hostname: event.host,
        path: event.path,
        port: 443,
        headers: event.headers,
        body: JSON.stringify(event.body)
    };

    console.log('request options', options);

    await rq(options)
        .then((res: any) => {
            console.log('http request response', res);
            response = {
                headers: {'Content-Type': 'application/json'},
                statusCode: 200,
                body: res.body
            };
        })
        .catch((err: any) => {
            console.error('request error', err);
            response = {
                headers: err.headers,
                statusCode: err.statusCode,
                body: err.body,
                statusMessage: err.statusMessage
            };
        });

    callback(null, response);

};

export { request };
