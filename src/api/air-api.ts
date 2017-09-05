import { AIRBNB_API } from "../constants";
import { Http } from "../http/http";
import ThreadResponse = Message.ThreadResponse;
import ListingResponse = Listings.ListingResponse;
import { Singleton } from '../singleton/singleton';

export class AirApi extends Singleton {

    private _http = Http.Singleton;

    private constructor() {
        super();
    }

    async fetchToken(id: string, pw: string) {
        const body = {
            'username': id,
            'password': pw,
            'prevent_account_creation': 'true'
        };

        const options = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Airbnb-API-Key': AIRBNB_API.KEY
            },
            json: true, // Automatically parses the JSON string in the response,
            encoding: 'UTF-8',
            gzip: true
        };

        let tokenResponse: any;

        let token: string;

        try {
            tokenResponse = await this._http.post(AIRBNB_API.ENDPOINTS.AUTH_PATH, body, options);
            console.log('tokenResponse', tokenResponse);
            token = tokenResponse.access_token
        } catch (e) {
            console.log('tokenResponse Error', tokenResponse);
            if (e.error.access_token) {
                token = e.error.access_token
            } else {
                throw Error('Failed to fetch token');
            }
        }

        this._http.transformAuthRequest(token);

        return token;
    }

    async fetchAllListings() {
        const res: ListingResponse = await this._http.get(AIRBNB_API.ENDPOINTS.LISTINGS_PATH);

        return res;
    }

    async fetchThreads(options: Message.ThreadRequest) {
        let qs = {
            role: 'all',
            _format: 'for_mobile_inbox',
            _offset: 0,
            _limit: 5,
            locale: 'en',
            currency: 'thb',
            selected_inbox_type: 'host',
            include_mt: true,
            include_help_threads: true,
            include_support_messaging_threads: true
        };

        Object.assign(qs, options);

        const res: ThreadResponse = await this._http.get(AIRBNB_API.ENDPOINTS.THREADS_PATH, qs);

        return res;
    }

    async fetchReservations() {
        const qs = {
            _format: 'for_host_dashboard',
            _offset: 0,
            _order: 'reservation_date',
            _limit: 5,
            host_id: 45188796
        };

        return await this._http.get(AIRBNB_API.ENDPOINTS.RESERVATIONS_PATH, qs);
    }

    async sendMessage(message: AirApi.message) {
        return await this._http.post(AIRBNB_API.ENDPOINTS.MESSAGE_PATH, message);
    }

    async getMessage() {
        const qs = {
            _format: 'for_web_inbox',
            _offset: 0,
            role: 'all',
            selected_inbox_type: 'host',
            include_mt: true,
            include_help_threads: true,
            include_support_messaging_threads: true,
            _limit: 5
        };

        return await this._http.get(AIRBNB_API.ENDPOINTS.RESERVATIONS_PATH, qs);
    }

}