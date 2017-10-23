import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Singleton } from '../singleton/singleton';

export class Dynamodb extends Singleton {
    public documentClient: DocumentClient;

    private constructor() {
        super();
        this.documentClient = new DocumentClient({
            region: 'ap-southeast-1'
        });
    }

    public put(params: any) {
        /*const params = {
            TableName: table,
            Item: {
                "year": year,
                "title": title,
                "info": {
                    "plot": "Nothing happens at all.",
                    "rating": 0
                }
            }
        };*/

        console.log('Adding a new item...', params);
        return this.documentClient.put(params, (err: any, data: any) => {
            if (err) {
                console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
            } else {
                console.log('Added item:', data, JSON.stringify(data, null, 2));
            }
        });
    }

    public read(params: any) {
        /*let params = {
            TableName: table,
            Key:{
                "year": year,
                "title": title
            }
        };*/

        return this.documentClient.get(params).promise();

    }

    public update(params: any) {

// Update the item, unconditionally,

        /*let params =

        let params = {
            TableName: table,
            Key: {
                "year": year,
                "title": title
            },
            UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
            ExpressionAttributeValues: {
                ":r": 5.5,
                ":p": "Everything happens all at once.",
                ":a": ["Larry", "Moe", "Curly"]
            },
            ReturnValues: "UPDATED_NEW"
        };*/

        console.log('Updating the item...');
        this.documentClient.update(params, (err: any, data: any) => {
            if (err) {
                console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
            } else {
                console.log('UpdateItem succeeded:', JSON.stringify(data, null, 2));
            }
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
        this.documentClient.delete(params, (err: any, data: any) => {
            if (err) {
                console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
            } else {
                console.log('DeleteItem succeeded:', JSON.stringify(data, null, 2));
            }
        });

    }

}
