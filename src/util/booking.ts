import { Dynamodb } from '../db/dynamodb';
import { DB } from '../db/dynamodb.d';

export class BookingUtil {
    private dynamoDb = Dynamodb.Singleton;

    public convertToDbInput(bookings: AirbnbType.Booking[]): DB.Bookings.PutItemInput[] {
        const bookingDbInputKeyList = [
            'confirmation_code=id',
            'guest.id',
            'guest.number_of_adults',
            'id=booking_id',
            'thread_id',
            'listing_id',
            'nights',
            'start_date'
        ];

        const dbInputList = this.dynamoDb.createBatchWriteParam(bookings, bookingDbInputKeyList);

        return dbInputList;
    }
}
