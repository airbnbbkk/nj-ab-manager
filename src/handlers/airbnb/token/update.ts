import { Callback, Context, Handler } from 'aws-lambda';
import * as Lambda from 'aws-sdk/clients/lambda';
import { Stage, Tables } from '../../../constants';
import { LambdaUtil } from '../../../util/lambda';

const lambda = new Lambda();
const lambdaUtil = LambdaUtil.Singleton;

const update: Handler = async (event: any, _context: Context, callback: Callback) => {
    console.log(event, _context);
    const payload = {
        body: {
            table: Tables[Stage].TOKEN,
            data: {
                id: 'token',
                token: event.body.token
            }
        }
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-db_update`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(payload)
    };

    console.log('updating Airbnb token', params);
    await lambda.invoke(params, async (err, res) => {
        let response: any;

        response = lambdaUtil.convertInvocationResToLambdaProxyRes(res);

        if (!response || !response.body || err) {
            console.error('error updating Airbnb token', response || err);
            callback(null, response || err);
        } else {
            console.log('Airbnb token has updated', response);
            callback(null, response);
        }
    }).promise();
};

export { update };
