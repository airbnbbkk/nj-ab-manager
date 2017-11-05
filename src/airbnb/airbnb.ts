import { ProxyResult } from 'aws-lambda';
import { AWSError } from 'aws-sdk/lib/error';
import { AIRBNB_API } from '../constants';
import { S3Storage } from '../s3/s3-storage';
import { Singleton } from '../singleton/singleton';
import { LambdaUtil } from '../util/lambda';

const lambdaUtil = LambdaUtil.Singleton;

class Airbnb extends Singleton {
    public async request(param: AirbnbType.AirbnbRequestParam) {
        const token = await this._getToken();
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

        const response = {
            statusCode: 200,
            body: ''
        };

        if (param.method === 'GET') {
            options.path = options.path + this.jsonToQueryString(param.data);
        }

        const params = lambdaUtil.getInvocationRequestParam(
            'http_request',
            'RequestResponse',
            options
        );

        console.log('Sending Airbnb request', params);

        try {
            const res = await lambdaUtil.invoke(params);
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

        return s3Storage.getValue('token');
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
