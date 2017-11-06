import * as rq from 'minimal-request-promise';
import { Singleton } from '../singleton/singleton';

export class HttpRequest extends Singleton {
    public request(param: any) {
        const options = {
            method: param.method,
            hostname: param.host,
            path: param.path,
            port: 443,
            headers: param.headers,
            body: JSON.stringify(param.body)
        };

        console.log('Sending a http request: ', options);

        return rq(options)
            .then((res: any) => {
                // console.log('Got a response from http request', res);
                return {
                    headers: {'Content-Type': 'application/json'},
                    statusCode: 200,
                    body: res.body
                };
            })
            .catch((err: any) => {
                console.error('Http request error', err);
                return {
                    headers: err.headers,
                    statusCode: err.statusCode,
                    body: err.body,
                    statusMessage: err.statusMessage
                };
            });
    }
}
