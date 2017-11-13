declare namespace AirbnbType {
    type HostId = number;
    type GuestId = number;
    type ResolutionId = number;
    type BookingId = number;

    interface HttpRequestParam {
        method: string;
        path: string;
        data: Dict;
    }

    interface HttpResponse {
        statusCode: number;
        body: string;
    }

    interface ResolutionRequest {
        _format: 'for_creation';
        initiator_id: HostId;
        receiver_id: GuestId;
        reason: 203;
        product_type: 'reservation';
        product_id: BookingId;
        beneficiary_id: HostId;
        version: 2;
        request_source: 'Resolution Center';
    }

    interface ResolutionResponse {
        resolution: {
            id: number;
            claim_id: number;
            max_amount: number;
            is_micros_accuracy: boolean;
            is_proportionate_payout: boolean;
            alipay_payin_only: boolean
        };
        metadata: {};
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