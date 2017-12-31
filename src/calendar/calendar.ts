import { Airbnb } from '../airbnb/airbnb';
import { AIRBNB_API } from '../constants';
import { Singleton } from '../singleton/singleton';

export class Calendar extends Singleton {
    private _airbnb = Airbnb.Singleton;

    public async get(param: Dict) {
        const data = Object.assign({
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
            'listing_ids[]       ': '22471822',
            'filter': 'all'
        }, param);

        return await this._airbnb.request({
            method: 'GET',
            path: AIRBNB_API.ENDPOINTS.MULTI_CALENDAR,
            data
        });
    }
}
