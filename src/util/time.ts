import { Singleton } from '../singleton/singleton';

export class Time extends Singleton {
    private _addHours = require('../../node_modules/date-fns/add_hours');
    private _addDays = require('../../node_modules/date-fns/add_days');
    private _startOfDay = require('../../node_modules/date-fns/start_of_day');
    private _dateFormat = require('../../node_modules/date-fns/format');
    private _endOfMonth = require('../../node_modules/date-fns/end_of_month');

    public now() {
        return this._addHours(new Date(), 7);
    }

    public addDays(date: Date, days: number) {
        return this._addDays(date, days);
    }

    public startOfDay(date: Date) {
        return this._startOfDay(date);
    }

    public format(date: Date | string | number,
                  format?: string,
                  options?: {
                      locale?: object
                  }) {
        return this._dateFormat(date, format, options);
    }

    public endOfMonth(date: Date) {
        return this._endOfMonth(date);
    }

}