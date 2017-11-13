import { Context, ProxyHandler, ProxyCallback, Handler } from 'aws-lambda';

// let google = require('googleapis');


export let auth: ProxyHandler = (_event: any,
                                 _context: Context,
                                 _callback: ProxyCallback) => {


    _callback(null, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
        },
        statusCode: 200,
        body: 'google-site-verification: google9b6e4b0054c34902.html'
    });
};

export let receive: Handler = (event) => {
    console.log(event);
};