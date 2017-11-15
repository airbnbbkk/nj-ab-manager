import { Callback, Context, Handler } from 'aws-lambda';
import { Booking } from '../../booking/booking';
import { Stage, Tables } from '../../constants';
import { Dynamodb } from '../../db/dynamodb';
import { Message } from '../../message/message';

const booking = Booking.Singleton;
const message = Message.Singleton;
const db = Dynamodb.Singleton;

const newBooking: Handler = async (_event: Event,
                                   _context: Context,
                                   callback: Callback) => {

    const newBookingDtoList = await booking.getNewBooking();

    console.log('newBookingDtoList', newBookingDtoList);

    newBookingDtoList.forEach(dto => {
        message.messageNewBooking(dto);
    });

    _saveNewBookingsToDb(newBookingDtoList);

    callback(null, {body: JSON.stringify(newBookingDtoList)})
};

const _saveNewBookingsToDb = (newBookingDtoList: any) => {

    const params = {
        RequestItems: {
            [Tables[Stage].BOOKINGS]: db.createBatchWriteParam(newBookingDtoList)
        }
    };
    console.log('params', JSON.stringify(params));
    db.batchWrite(params);
};

export { newBooking }