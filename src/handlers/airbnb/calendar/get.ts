import { Context, ProxyCallback, ProxyHandler, ProxyResult } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { AIRBNB_API } from '../../../constants';

const airbnb = new Airbnb();

const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    console.log(event, _context);

    const qs = {
        'currency': 'THB',
        'locale': 'en',
        '_format': 'host_calendar_detailed', // 'multi_calendar',
        'listing_ids[]': '19097139',
        'listing_ids[] ': '16268602',
        'listing_ids[]  ': '17972084',
        'listing_ids[]   ': '18722790',
        'listing_ids[]    ': '20777226',
        'listing_ids[]     ': '21170179',
        'listing_ids[]      ': '16874939',
        'filter': 'all'
    };

    if (event.query) {
        Object.assign(qs, event.query);
    }

    const resBody = await airbnb.request('GET', AIRBNB_API.ENDPOINTS.MULTI_CALENDAR, qs);

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
