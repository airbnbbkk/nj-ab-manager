import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Singleton } from '../singleton/singleton';

export class Dynamodb extends Singleton {
    private _docClient: any;


    private constructor() {
        super();
        this._docClient = new DocumentClient({
            region: "ap-southeast-1"
        });
    }

    public create() {

        let params_token = {
            TableName: "Token",
            KeySchema: [
                {AttributeName: "token", KeyType: "HASH"}  //Partition key
            ],
            AttributeDefinitions: [
                {AttributeName: "token", AttributeType: "S"}
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };

        /*let params_threadCount = {
            TableName: "ThreadCounts",
            KeySchema: [
                {AttributeName: "id", KeyType: "HASH"}  //Partition key
            ],
            AttributeDefinitions: [
                {AttributeName: "id", AttributeType: "S"}
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };*/

        console.log('creating a table...');

        return this._docClient.createTable(params_token).promise((err: any, data: any) => {
            if (err) {
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            }
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

        console.log("Adding a new item...", params);
        return this._docClient.put(params, function (err: any, data: any) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Added item:", data, JSON.stringify(data, null, 2));
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

        return this._docClient.get(params).promise((err: any, data: any) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                return data;
            }
        });

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

        console.log("Updating the item...");
        this._docClient.update(params, function (err: any, data: any) {
            if (err) {
                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            }
        });

    }

    public delete() {

        let table = "Movies";

        let year = 2015;
        let title = "The Big New Movie";

        let params = {
            TableName: table,
            Key: {
                "year": year,
                "title": title
            }
        };

        console.log("Attempting a conditional delete...");
        this._docClient.delete(params, function (err: any, data: any) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            }
        });

    }


}
