declare namespace AirbnbType {
    interface AirbnbRequestParam {
        method: string;
        path: string;
        data: Dict;
    }

    interface Booking {
        confirmation_code: string;
        guest: {
            email: string;
            first_name: number;
            id: number;
            phone: number;
            picture_url: number
        };
        guest_details: {
            localized_description: number;
            number_of_adults: number;
            number_of_children: number;
            number_of_infants: number
        };
        has_unread_messages: boolean;
        id: number;
        listing_id: number;
        nights: number;
        number_of_guests: number;
        recently_accepted: boolean;
        start_date: string;
        thread_id: number;
    }
}