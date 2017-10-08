import { Bootstrap } from './src/bootstrap/bootstrap';
import { Message } from './src/message/message';

require('request');

const bootstrap = Bootstrap.Singleton;
const _message = Message.Singleton;

export const hello = async (event: any, _context: any, callback: any) => {
    let response: any;

    try {
        await bootstrap.init();
    } catch (e) {
        throw Error(`Failed to bootstrap ${e}`);
    }


    try {
        console.log('get new reservations');
        await _message.responseToNewReservations();
    } catch (e) {
        throw Error(`Failed to response to new reservations ${e}`);
    }

    response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'success',
            input: event
        })
    };

    callback(null, response);

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

export const message = async (event: any, _context: any, callback: any) => {
    let response: any;
    let resBody: any;

    console.log(event, _context);

    const reqBody = JSON.parse(event.body);

    try {
        await bootstrap.init();
    } catch (e) {
        throw Error(`Failed to bootstrap ${e}`);
    }

    try {
        console.log('send message', reqBody);
        resBody = await _message.send(reqBody.receiver, reqBody.message);
    } catch (e) {
        throw Error(`Failed to send message ${e}`);
    }

    response = {
        statusCode: resBody.error_code || 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        },
        body: JSON.stringify(resBody)
    };

    callback(null, response);
}
