import * as S3 from 'aws-sdk/clients/s3';
import { S3_BUCKET, Stage } from '../constants';
import { Singleton } from '../singleton/singleton';

export class S3Storage extends Singleton {
    private readonly _s3 = new S3();
    private _cache: Dict = {};

    public async putValue(key: string, value: string) {
        console.log(`putting s3 variable key: ${key} with the value: ${value}`);
        const params = {
            Body: value,
            Bucket: S3_BUCKET.NAME[Stage],
            Key: key
        };
        this._s3.putObject(params).promise().then((res) => {
            console.log(`s3 variable has put successfully`, res);
        }).catch(err => {
            throw Error(err);
        });
    }

    public async getValue(key: string) {
        const params = {
            Bucket: S3_BUCKET.NAME[Stage],
            Key: key
        };

        if (this._cache[key]) {
            console.log(`s3 variable value ${key} found in the cache`);
            return this._cache[key];
        }

        return this._s3.getObject(params).promise()
            .then(data => {
                const result = data.Body.toString();
                this._cache[key] = result;
                console.log(`s3 object '${key}' retrieved`, result);
                return result;
            })
            .catch(err => {
                throw Error(err);
            });
    }
}
