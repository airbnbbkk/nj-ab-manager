export namespace DB {
    interface PutItemInput {
        id: string | number;
        updated_at: number;
        created_at: number;

        [key: string ]: any;
    }

    namespace Bookings {
        type PutItemInput = DB.PutItemInput & {
            id: string;
            guest: {
                id: number;
                number_of_adults: number;
            }
            booking_id: number;
            thread_id:  number;
            listing_id: number;
            start_date: number;
            end_date: number;
        }
    }
}