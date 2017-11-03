import { AIRBNB_API, Stage } from '../constants';
import { Singleton } from '../singleton/singleton';
import { LambdaUtil } from '../util/lambda';

const lambdaUtil = LambdaUtil.Singleton;

class Airbnb extends Singleton {
    public async request(method: string, path: string, body: object) {
        const token = await this._getToken();

        const options = {
            method,
            host: AIRBNB_API.ENDPOINTS.HOST,
            path,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
                'X-Airbnb-OAuth-Token': token
            },
            body
        };

        if (method === 'GET') {
            options.path = options.path + this.jsonToQueryString(body);
        }

        const params = {
            FunctionName: `airbnb-manager-${Stage}-http_request`,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(options)
        };

        console.log('sending Airbnb request', params);

        const res = await lambdaUtil.invoke(params);

        return res;

    }

    private async _getToken() {
        const params = {
            FunctionName: `airbnb-manager-${Stage}-airbnb_get_token`,
            InvocationType: 'RequestResponse',
            Payload: ''
        };

        const tokenRes = await lambdaUtil.invoke(params);

        return tokenRes.body;
    }

    private jsonToQueryString(json: any) {
        return '?' +
            Object.keys(json).map(key => {
                return encodeURIComponent(key.replace(/ /g, '')) + '=' +
                    encodeURIComponent(json[key]);
            }).join('&');
    }
}

export { Airbnb };
