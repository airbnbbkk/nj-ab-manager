import { Callback, Context, Handler } from 'aws-lambda';
import { Stage, Tables } from '../../../constants';
import { DB } from '../../../typings';
import { LambdaUtil } from '../../../util/lambda';

const lambdaUtil = new LambdaUtil();

const update: Handler = async (event: any, _context: Context, _callback: Callback) => {
    console.log(event, _context);
    const payload = {
        body: {
            table: Tables[Stage].BOOKINGS,
            data: event.body.data as DB.Bookings.PutItemInput[]
        }
    };

    const params = {
        FunctionName: `airbnb-manager-${Stage}-db_create`,
        InvocationType: 'Event',
        Payload: JSON.stringify(payload)
    };

    console.log('updating Bookings table', params);
    await lambdaUtil.invoke(params);
};

export { update };
