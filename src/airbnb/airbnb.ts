import * as Lambda from 'aws-sdk/clients/lambda';
import { AIRBNB_API, Stage } from '../constants';
import { LambdaUtil } from '../util/lambda';

const lambdaUtil = new LambdaUtil();
const lambda = new Lambda();

class Airbnb {
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

        return await lambda.invoke(params)
            .promise()
            .then(res => {
                const response = lambdaUtil.convertInvocationResToLambdaProxyRes(res);
                console.log('got Airbnb request', response);
                return response;
            })
            .catch(err => {
                console.error('sending Airbnb message failed', err);
                return Error(err);
            });
    }

    public findLanguage(text: string): Locale {
        let lang: Locale = 'en';

        if (!text) {
            return lang;
        }

        const tests = [
            {regex: /[\uac00-\ud7af]+/g, lang: 'ko'},
            {regex: /[\u4e00-\u9fff]+/g, lang: 'cn'}];

        tests.forEach((test: any) => {
            if (text.match(test.regex)) {
                lang = test.lang;
                return;
            }
        });

        return lang;
    }

    private async _getToken() {
        const params = {
            FunctionName: `airbnb-manager-${Stage}-airbnb_get_token`,
            InvocationType: 'RequestResponse',
            Payload: ''
        };

        return await lambda.invoke(params).promise()
            .then(res => {
                const response = lambdaUtil.convertInvocationResToLambdaProxyRes(res);

                return response.body;
            })
            .catch(err => {
                console.error('failed to get token', err);
                return err;
            });
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
