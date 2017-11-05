import { Context, ProxyCallback, ProxyHandler } from 'aws-lambda';
import { Airbnb } from '../../../airbnb/airbnb';
import { AIRBNB_API } from '../../../constants';

const airbnb = Airbnb.Singleton;

const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    const reqData = event.data as Dict || {};

    const qs = {
        'currency': 'THB',
        'locale': 'en',
        '_format': 'multi_calendar', // 'multi_calendar', 'host_calendar_detailed'
        'listing_ids[]': '19097139',
        'listing_ids[] ': '16268602',
        'listing_ids[]  ': '17972084',
        'listing_ids[]   ': '18722790',
        'listing_ids[]    ': '20777226',
        'listing_ids[]     ': '21170179',
        'listing_ids[]      ': '16874939',
        'filter': 'all'
    };

    Object.assign(qs, reqData);

    callback(null, await airbnb.request('GET', AIRBNB_API.ENDPOINTS.MULTI_CALENDAR, qs));
};

export { get };
