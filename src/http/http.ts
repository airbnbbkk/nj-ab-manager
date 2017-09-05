import { AIRBNB_API } from "../constants";
import * as request from "request";
import * as requestPromise from "request-promise";
import HttpInterface = Http.HttpInterface;
import { Singleton } from '../singleton/singleton';

export class Http extends Singleton implements HttpInterface {
    private _client: request.RequestAPI<requestPromise.RequestPromise, requestPromise.RequestPromiseOptions, request.RequiredUriUrl>;

    private constructor() {
        super();
        this._client = requestPromise;
    }

    async get(path: string, qs?: object) {
        let options = {
            uri: AIRBNB_API.ENDPOINTS.HOST + path,
            qs: qs
        };

        return await this.request(options);
    }

    async post(path: string, body: object, opt?: request.CoreOptions) {
        let options: request.Options = {
            method: 'POST',
            uri: AIRBNB_API.ENDPOINTS.HOST + path,
            body: body
        };

        Object.assign(options, opt);

        return await this.request(options);
    }

    transformAuthRequest(token: string) {
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


    private request(options: request.Options) {
        this._client.debug = false;
        return this._client(options)
            .then(res => {
                console.log('http request response', res)
                return res;
            })
            .catch(async (err) => {
                if (err.error.error_code === 401) {

                }
                throw Error(`Error http request:\n ${JSON.stringify(options)} \n ${err}`);
            });
    }

    /*private async _fetchToken(id: string, pw: string) {
        const body = {
            'username': id,
            'password': pw,
            'prevent_account_creation': 'true'
        };

        const options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Airbnb-API-Key': AIRBNB_API.KEY
            },
            json: true, // Automatically parses the JSON string in the response,
            encoding: 'UTF-8',
            gzip: true
        };

        const tokenResponse = await this.post(AIRBNB_API.ENDPOINTS.AUTH_PATH, body, options);

        this.transformAuthRequest(tokenResponse.access_token);

        return tokenResponse;
    }*/
}