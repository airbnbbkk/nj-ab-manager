import { Context, ProxyCallback, ProxyHandler, ProxyResult } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { AIRBNB_API } from '../../../constants';

const airbnb = new Airbnb();

const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    console.log(event, _context);

    const qs = {
        role: 'reservations',
        _format: 'for_web_inbox',
        _offset: 0,
        _limit: 5,
        locale: 'en',
        currency: 'thb',
        selected_inbox_type: 'host',
        include_mt: true,
        include_help_threads: true,
        include_support_messaging_threads: true
    };

    if (event.queryStringParameters) {
        Object.assign(qs, event.queryStringParameters);
    }

    const resBody = await airbnb.request('GET', AIRBNB_API.ENDPOINTS.THREADS_PATH, qs);

    const result = {
        statusCode: (resBody as any).error_code || 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: (resBody as ProxyResult).body
    };

    callback(null, result);
};

export { get };
