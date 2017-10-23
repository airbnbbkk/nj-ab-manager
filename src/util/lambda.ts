import { ProxyResult } from 'aws-lambda';
import { InvocationResponse } from '../../node_modules/aws-sdk/clients/lambda';

class LambdaUtil {
    public convertInvocationResToLambdaRes(res: InvocationResponse): ProxyResult {
        console.log('converting invocation response', res);
        if (!res) {
            console.log('invocation response is false', res);
            return null;
        }

        const response = JSON.parse(res.Payload as string);

        if (response.body) {
            response.statusCode = response.errorMessage ? 500 : response.statusCode || 200;
            response.headers = {'Content-Type': 'application/json'};
            response.body = typeof response.body === 'string' ?
                response.body : JSON.stringify(response.body);
        }

        return response;
    }
}

export { LambdaUtil };
