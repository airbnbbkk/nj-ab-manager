import { Callback, Context, Handler } from 'aws-lambda';
import * as S3 from 'aws-sdk/clients/s3';

const test: Handler = (_event: any,
                       _context: Context,
                       _callback: Callback) => {

    const s3 = new S3();
    s3.getObject({
        Bucket: 'airbnb-manager-dev-serverlessdeploymentbucket-ee1rvm7afu76',
        Key: 'token1',
        ResponseContentType: 'text/plain'
    }).promise().then(data => {
        console.log('result', data);
    }).catch(err => {
        console.log('error!!!!!!!!!!!!!!!!!!');
        throw Error(err);
    });


};

export { test };
