import { Callback, Context, Handler } from 'aws-lambda';
import * as Lambda from 'aws-sdk/clients/lambda';
import { AIRBNB_API, Stage } from '../../../constants';
import { LambdaUtil } from '../../../util/lambda';

const fetch: Handler = (_event: any, _context: Context, callback: Callback) => {
    const lambda = new Lambda();
    const lambdaUtil = new LambdaUtil();

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

    const params = {
        FunctionName: `airbnb-manager-${Stage}-http_request`,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(options)
    };

    console.log('fetching Airbnb token', params);
    lambda.invoke(params, (err, res) => {
        const response = lambdaUtil.convertInvocationResToLambdaRes(res);

        if (err) {
            console.log('fetching Airbnb token failed', err);
        } else {
            console.log('tokenResponse', response);
        }

        callback(null, response);
    });
};

export { fetch };
