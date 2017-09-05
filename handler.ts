import { Bootstrap } from './src/bootstrap/bootstrap';
import { Message } from "./src/message/message";

require('request');

const bootstrap = Bootstrap.Singleton;

export const hello = async (event: any, _context: any, callback: any) => {
    let response: any;

    try {
        await bootstrap.init();
    } catch (e) {
        throw Error(`Failed to bootstrap ${e}`);
    }

    const message = Message.Singleton;

    try {
        console.log('get new reservations');
        await message.responseToNewReservations();
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
