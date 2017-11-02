import { Callback, Context, Handler } from 'aws-lambda';
import * as Lambda from 'aws-sdk/clients/lambda';
import { Stage, Tables } from '../../../constants';
import { LambdaUtil } from '../../../util/lambda';

const lambda = new Lambda();
const lambdaUtil = new LambdaUtil();

const get: Handler = async (_event: any, _context: Context, callback: Callback) => {

    const payload = {
        body: {
            table: Tables[Stage].TOKEN,
            id: 'token'
        }
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-db_get`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(payload)
    };

    console.log('getting Airbnb token', params);
    await lambda.invoke(params)
        .promise()
        .then(async (res) => {
            const response = lambdaUtil.convertInvocationResToLambdaProxyRes(res);

            if (!response || !response.body) {
                try {
                    console.log('error getting Airbnb token from db, trying to fetch from Airbnb'
                        , response);
                    response.body = await _fetchToken();
                    _saveToken(response.body);

                    callback(null, response);
                } catch (err) {
                    console.error('Fetching Airbnb token failed', err);
                    callback(null, err);
                }
            } else {
                console.log('Airbnb token has retrieved from db', response);
                const token = {body: JSON.parse(response.body).token};
                callback(null, token);
            }
        })
        .catch(err => {
            throw Error(`Error invoking lambda function: ${params.FunctionName} \n ${err}`);
        });
};

const _fetchToken = async () => {
    let response: any = null;

    const params = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_fetch_token`,
        InvocationType: 'RequestResponse',
        Payload: ''
    };

    console.log('fetching Airbnb token');
    return await lambda.invoke(params).promise().then(res => {
        response = lambdaUtil.convertInvocationResToLambdaProxyRes(res);

        if (!response || !response.body) {
            console.log('error fetching Airbnb token');
            return;
        }
        const token = JSON.parse(response.body).access_token;

        console.log('Airbnb token has fetched', token);

        return token;
    }).catch(err => {
        console.log('error fetching Airbnb token', err);
    });
};

const _saveToken = (token: string): void => {
    const body = {
        token
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-airbnb_update_token`,
        InvocationType: 'Event',
        Payload: JSON.stringify({body})
    };

    console.log('saving Airbnb token to DB', params);
    lambda.invoke(params, (err, res) => {
        if (err) {
            console.log('error updating Airbnb token', err);
            throw Error(`Error invoking lambda: ${params.FunctionName} \n${err}`);
        }

        const response = lambdaUtil.convertInvocationResToLambdaProxyRes(res);

        if (response.statusCode === 500) {
            console.error('Error saving token to db', response);
        } else {
            console.log('Airbnb token has been updated', response);
        }
    });
};

export { get };
