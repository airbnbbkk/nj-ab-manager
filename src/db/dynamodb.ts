import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk/lib/error';
import * as uuidv1 from 'uuid/v1';
import { Singleton } from '../singleton/singleton';
import BatchWriteItemInput = DocumentClient.BatchWriteItemInput;
import BatchWriteItemOutput = DocumentClient.BatchWriteItemOutput;
import GetItemInput = DocumentClient.GetItemInput;
import GetItemOutput = DocumentClient.GetItemOutput;
import PutItemOutput = DocumentClient.PutItemOutput;

export class Dynamodb extends Singleton {
    private _db: DocumentClient;

    private constructor() {
        super();
        this._db = new DocumentClient({
            region: 'ap-southeast-1'
        });
    }

    public put(params: any) {
        console.log('Adding a new item...', params);
        const timestamp = new Date().getTime();
        const item = Object.assign({
            id: params.id || uuidv1(),
            created_at: timestamp,
            updated_at: timestamp
        }, params);

        return this._db.put(item).promise()
            .then((data: PutItemOutput) => {
                console.log('Added an item:', data, JSON.stringify(data, null));
                return data;
            })
            .catch((err: AWSError) => {
                console.error('Unable to add an item:', JSON.stringify(err, null, 2));
                return err;
            });
    }

    public batchWrite(params: BatchWriteItemInput) {
        console.log('batch adding new items...', JSON.stringify(params));
        return this._db.batchWrite(params).promise()
            .then((data: BatchWriteItemOutput) => {
                console.log('Added items:', data, JSON.stringify(data, null));
                return data;
            })
            .catch((err: AWSError) => {
                console.error('Unable to batch write items:', JSON.stringify(err, null, 2));
                return err;
            });
    }

    public get(params: GetItemInput) {
        console.log('batch adding new items...', JSON.stringify(params));
        return this._db.get(params).promise()
            .then((data: GetItemOutput) => {
                console.log('Got an item:', data, JSON.stringify(data, null));
                return data;
            })
            .catch((err: AWSError) => {
                console.error('Unable to get an items:', JSON.stringify(err, null, 2));
                return err;
            });
    }

    public update(data: any) {
        const params = this._createUpdateParam(data);
        console.log('Updating an item...', params);
        return this._db.update(params).promise()
            .then((data: PutItemOutput) => {
                console.log('Updated an item:', data, JSON.stringify(data, null));
                return data;
            })
            .catch((err: AWSError) => {
                console.error('Failed to update an item:', JSON.stringify(err, null, 2));
                return err;
            });

    }

    public delete() {

        const table = 'Movies';

        const year = 2015;
        const title = 'The Big New Movie';

        const params = {
            TableName: table,
            Key: {
                year,
                title
            }
        };

        console.log('Attempting a conditional delete...');
        this._db.delete(params, (err: any, data: any) => {
            if (err) {
                console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
            } else {
                console.log('DeleteItem succeeded:', JSON.stringify(data, null, 2));
            }
        });

    }

    public createBatchWriteParam(items: any[], keyList?: string[]) {
        const timestamp = new Date().getTime();
        const params = items.map((item: any) => {

            const param: any = {
                PutRequest: {
                    Item: {
                        id: item.id || uuidv1(),
                        created_at: timestamp,
                        updated_at: timestamp
                    }
                }
            };

            (keyList || Object.keys(item)).forEach((key: string) => {
                this._addProperties(param.PutRequest.Item, item, key);
                this._processProperties(param.PutRequest.Item);
            });

            return param;
        });

        return params;
    }

    private _addProperties(target: Dict, obj: Dict, key: string) {
        if (key.includes('.')) {
            key.split('.').reduce((o, name) => {
                if (typeof o[name] !== 'object') {
                    _assign(target, name, o);
                } else {
                    target[name] = target[name] || {};
                    target = target[name];
                }
                return o[name];
            }, obj);

        } else {
            _assign(target, key, obj);
        }

        function _assign(t: Dict, k: string, o: any) {
            const name = k.split('=');
            console.log('_assign', t, name, o);
            t[name[1] || name[0]] = o[name[0]];
        }
    }

    private _processProperties(param: any) {
        const dateKeys = ['start_date', 'end_date'];

        // change string dates to UNIX time number
        dateKeys.forEach(date => {
            if (param.hasOwnProperty(date)) {
                param[date] = new Date(param[date]).getTime();
            }
        });
        return param;
    }

    private _createUpdateParam(data: any) {
        const param = {
            TableName: data.table,
            Key: data.key,
            ExpressionAttributeValues: {} as any,
            UpdateExpression: 'SET',
            /*UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',*/
            ReturnValues: 'NONE'
        };

        Object.keys(data.data).forEach((key: string, i: number, arr: any[]) => {
            param.ExpressionAttributeValues[`:${key}`] = data.data[key];
            param.UpdateExpression += ` ${key} = :${key}${i !== (arr.length - 1) ? ',' : ''}`;
        });

        return param;
    };
}
