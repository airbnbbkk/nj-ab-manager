import { Message } from '../message/message';
import { Singleton } from '../singleton/singleton';
import { LambdaUtil } from '../util/lambda';

const message = Message.Singleton;
const lambdaUtil = LambdaUtil.Singleton;
const config = require('../../config/config.json');

export class Booking extends Singleton {

    public async getNewBooking(minutesBefore = config.aws.schedule.schedule_new_booking.interval) {
        const newBookingEmailList: any = await lambdaUtil.invoke(
            lambdaUtil.getInvocationRequestParam(
                'google_api_call',
                'RequestResponse',
                {
                    name: 'getNewBookingEmails',
                    param: minutesBefore
                }));

        console.log('newBookingEmailList', newBookingEmailList);

        if (!newBookingEmailList) {
            return null;
        }

        const bookingDtoList = await Promise.all(newBookingEmailList.map(async (email) => {
            const dto = await this.getBookingDto(email.id);

            return dto;
        }));

        return bookingDtoList;
    }

    public async getBookingDto(bookingId: string) {
        const bookingEmailMessage = await lambdaUtil.invoke(
            lambdaUtil.getInvocationRequestParam(
                'google_api_call',
                'RequestResponse',
                {
                    name: 'getNewBookingEmail',
                    param: bookingId
                }));

        return this._convertToBookingDto(bookingEmailMessage);
    }

    private _convertToBookingDto(text: string) {
        const regMap = {
            id: /Confirmation code\r\n(\w.*)/g,
            message: /since \d{4}([\w\W]*)Send/g,
            threadId: /airbnb.com\/z\/q\/(\d+)/g,
            listingId: /airbnb.com\/rooms\/show\?euid=.+&id=(\d+)/g,
            country: /([A-Z][\w ]+)\r\nOn Airbnb/g,
            name: /! (.+) arrives/g
        };

        const dto: any = {
            id: this._findValue(text, regMap.id),
            threadId: this._findValue(text, regMap.threadId),
            listingId: this._findValue(text, regMap.listingId),
            lang: this._findLanguage(text, regMap),
            name: this._findValue(text, regMap.name)
        };

        return dto;
    }

    private _findLanguage(text, regMap) {
        const msg = this._findValue(text, regMap.message).replace(/\r?\n|\r/g, '');

        return msg ? message.findLanguage(msg) :
            this._checkLangByCountry(this._findValue(text, regMap.country));
    }

    private _findValue(text: string, regex: RegExp) {
        const results = regex.exec(text);

        return results ? results[1] : null;
    }

    private _checkLangByCountry(country: string) {
        if (country.match(/korea/i)) {
            return 'ko'
        } else if (country.match(/china/i)) {
            return 'cn'
        } else {
            return 'en';
        }
    }
}

/*
const get: ProxyHandler = async (event: any,
                                 _context: Context,
                                 callback: ProxyCallback) => {

    const reqData = event.data as Dict || {};

    const qs = Object.assign({
        _format: 'for_host_dashboard',
        _offset: 5,
        _order: 'start_date',
        _limit: 2,
        host_id: ACCOUNT.HOST_ID,
        currency: 'THB',
        locale: 'en'
    }, reqData);

    callback(null, await airbnb.request('GET', AIRBNB_API.ENDPOINTS.RESERVATIONS_PATH, qs));
};
*/
