import { ProxyResult } from 'aws-lambda';
import { AWSError } from 'aws-sdk/lib/error';
import { AIRBNB_API } from '../constants';
import { HttpRequest } from '../http/request';
import { S3Storage } from '../s3/s3-storage';
import { Singleton } from '../singleton/singleton';
import AirbnbResponse = AirbnbType.HttpResponse;

class Airbnb extends Singleton {
    private _http = HttpRequest.Singleton;
    private _s3Stroage = S3Storage.Singleton;

    public async request(param: AirbnbType.HttpRequestParam): Promise<AirbnbResponse> {
        let token = await this._getToken();
        const options = {
            method: param.method,
            host: AIRBNB_API.ENDPOINTS.HOST,
            path: param.path,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Airbnb-API-Key': AIRBNB_API.KEY,
                'X-Airbnb-OAuth-Token': token
            },
            body: param.data
        };

        const response: AirbnbResponse = {
            statusCode: 200,
            body: ''
        };

        if (param.method === 'GET') {
            options.path = options.path + this.jsonToQueryString(param.data);
        }

        console.log('Sending Airbnb request', options);

        try {
            let res = await this._http.request(options);
            if (res.statusCode === 401) {
                console.error('Airbnb Auth Error!', res);

                token = await this._renewToken();
                options.headers['X-Airbnb-OAuth-Token'] = token;

                console.log('making the same previously failed request with a new token again');

                res = this._http.request(options);
            }
            response.statusCode = (res as AWSError).statusCode || response.statusCode;
            response.body = (res as ProxyResult).body;
        } catch (e) {
            console.error('Failed in sending Airbnb request', e);
            response.body = JSON.stringify(e, null, 2);
        }

        return response;
    }

    private async _getToken() {
        const s3Storage = S3Storage.Singleton;

        let token = s3Storage.getValue('token');
        if (!token) {
            console.error(`Token from S3 storage is ${token}...trying to get a new token `);
            token = await this._renewToken();
        }
        return token;
    }

    private async _renewToken() {
        const token = await this._fetchToken();
        this._saveTokenToS3Storage(token);

        return token;
    }

    private async _fetchToken() {
        const body = {
            username: 'stardom8387@gmail.com',
            password: 'Stardom84!',
            prevent_account_creation: 'true'
        };

        const options = {
            method: 'POST',
            host: AIRBNB_API.ENDPOINTS.HOST,
            path: AIRBNB_API.ENDPOINTS.AUTH_PATH,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn52tv0t20'
            },
            json: true, // Automatically parses the JSON string in the response,
            body
        };

        try {
            console.log('Fetching token from Airbnb', options);
            const res = await this._http.request(options);
            console.log('Token has fetched', res);
            return JSON.parse(res.body).access_token;
        } catch (e) {
            throw Error(`Failed to fetch Airbnb token: ${JSON.stringify(e)}`);
        }
    }

    private _saveTokenToS3Storage(token: string) {
        console.log('Saving Airbnb token to S3 stroage', token);
        this._s3Stroage.putValue('token', token);
    }

    private jsonToQueryString(json: Dict) {
        return '?' +
            Object.keys(json).map(key => {
                return encodeURIComponent(key.replace(/ /g, '')) + '=' +
                    encodeURIComponent(json[key]);
            }).join('&');
    }
}

export { Airbnb };
