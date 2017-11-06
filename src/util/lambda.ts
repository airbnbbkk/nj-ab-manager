import { ProxyResult } from 'aws-lambda';
import * as Lambda from 'aws-sdk/clients/lambda';
import { Stage } from '../constants';
import { Singleton } from '../singleton/singleton';

class LambdaUtil extends Singleton {
    public convertInvocationResToLambdaProxyRes(res: Lambda.InvocationResponse): ProxyResult {
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

    public async invoke(params: Lambda.Types.InvocationRequest) {
        const lambda = new Lambda();

        return await lambda.invoke(params)
            .promise()
            .then(res => {
                let response = null;
                if (params.InvocationType === 'RequestResponse') {
                    response = this.convertInvocationResToLambdaProxyRes(res);
                }
                console.log(`Lambda ${params.FunctionName} invoked successfully`, response);
                return response;
            })
            .catch(err => {
                console.error(`Failed to invoke Lambda ${params.FunctionName}`, err);
                throw Error(err);
            });
    }

    public getInvocationRequestParam(fnName: string, invocType: string, body: Dict): Lambda.Types.InvocationRequest {
        return {
            FunctionName: `airbnb-manager-${Stage}-${fnName}`,
            InvocationType: invocType,
            Payload: JSON.stringify({
                body
            })
        };
    }
}

export { LambdaUtil };
