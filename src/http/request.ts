import * as rq from 'minimal-request-promise';
import { Singleton } from '../singleton/singleton';

export class HttpRequest extends Singleton {
    public request(param: any) {
        let response: Dict = {};

        const options = {
            method: param.method,
            hostname: param.host,
            path: param.path,
            port: 443,
            headers: param.headers,
            body: JSON.stringify(param.body)
        };

        console.log('request options', options);

        rq(options)
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

        return response;
    };
}