import * as request from 'request';
import * as requestPromise from 'request-promise';
import { AIRBNB_API } from '../constants';
import { Singleton } from '../singleton/singleton';
import HttpInterface = Http.HttpInterface;

export class Http extends Singleton implements HttpInterface {
    private _client: request.RequestAPI<requestPromise.RequestPromise, requestPromise.RequestPromiseOptions, request.RequiredUriUrl>;

    private constructor() {
        super();
        this._client = requestPromise;
    }

    public async get(path: string, qs?: object) {
        const options = {
            uri: AIRBNB_API.ENDPOINTS.HOST + path,
            qs
        };

        return await this.request(options);
    }

    public async post(path: string, body: object, opt?: request.CoreOptions) {
        const options: request.Options = {
            method: 'POST',
            uri: AIRBNB_API.ENDPOINTS.HOST + path,
            body
        };

        Object.assign(options, opt);

        return await this.request(options);
    }

    public transformAuthRequest(token: string) {
        const options = {
            headers: {
                'X-Airbnb-API-Key': AIRBNB_API.KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Airbnb-OAuth-Token': token
            },
            json: true, // Automatically parses the JSON string in the response,
            encoding: 'UTF-8',
            gzip: true
        };

        console.log('options', options);

        this._client = this._client.defaults(options);
    }

    private request(options: request.Options & any) {
        this._client.debug = false;
        options.simple = false;
        return this._client(options)
            .then(res => {
                console.log('http request response', res);
                return res;
            })
            .catch(async (err) => {
                console.log('request error', err);
                if (err.error.error_code === 420) {
                    return err;
                }
                throw Error(`Error http request:\n ${JSON.stringify(options)} \n ${err}`);
            });
    }
}
