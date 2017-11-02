export class Time {
    public format(date: Date | string | number,
                  format?: string,
                  options?: {
                      locale?: object
                  }) {
        const dateFormat = require('../../node_modules/date-fns/format');

        return dateFormat(date, format, options);
    }

    public endOfMonth(date: Date) {
        const endOfMonth = require('../../node_modules/date-fns/end_of_month');

        return endOfMonth(date);
    }

}