declare namespace Message {

    interface MessageInterface {
        fetchNewReservation(): Promise<Array<ThreadUI>>

        fetchThreadByRole(role: Role): Promise<ThreadResponse>
    }

    type ThreadFormat = 'for_web_inbox' | 'for_messaging_sync';

    type Role = 'all' | 'reservations' | 'unread' | 'starred';

    type InboxType = 'host' | 'guest';

    type ThreadRequest = {
        _format?: Message.ThreadFormat;
        _offset?: number;
        _limit?: number;
        role?: Message.Role;
        selected_inbox_type?: Message.InboxType;
        include_mt?: boolean;
        include_help_threads?: boolean;
        include_support_messaging_threads?: boolean;
        currency?: Currency;
        locale?: Locale;
    };

    interface Thread {
        archived: boolean;
        attachment: string;
        business_purpose: string;
        id: number;
        review_id: string;
        status: string;
        unread: boolean;
    }

    type ThreadResponse = {
        threads: Array<ThreadDetailed>,
        metadata: Metadata.Metadata
    };

    type ThreadUI = Thread & {
        help_thread: string;
        guest_review_button: boolean;
        inquiry_date_range: string;
        last_message_at_smarter: string;
        listing: {
            address_preview: string;
            name: string
        };
        message_snippet: string;
        other_user: {
            id: number;
            first_name: string;
            profile_pic_url_small: string;
            profile_path: string
        };
        starred: boolean;
        status_string: string;
        status_tooltip_text: string;
        total_price_web_inbox: string;
        replace_profile_photo_with_initial: boolean;
        thread_url: string
    };

    namespace Metadata {
        type Metadata = {
            should_split_inbox: boolean;
            current_inbox: string;
            unread_host_count: number;
            unread_guest_count: number;
            experiments: {
                show_listing_name: boolean
            };
            filter_options: ThreadCounts;
            num_pages: number
        }

        type ThreadCounts = {
            [key: string]: any;
            unread: number;
            reservations: number;
            starred: number;
            hidden: number;
            all: number;
            pending_requests: number;
            late_or_no_response: number;
        };
    }

    type ThreadDetailed = Thread & {
        expires_at: string;
        has_pending_alteration_request: boolean;
        inquiry_checkin_date: string;
        inquiry_checkout_date: string;
        inquiry_listing: {
            has_paid_amenities: boolean;
            hosts: Array<User>;
            id: number;
            instant_book_enabled: boolean;
            instant_bookable: boolean;
            name: string;
            primary_host: User
        };
        inquiry_number_of_guests: number;
        inquiry_reservation: {
            confirmation_code: string;
            guest_identifications_required: boolean;
            id: number;
            paid_amenity_orders: Array<number>;
            pending_expires_at: string;
            status: string;
            using_identity_flow: boolean
        };
        inquiry_special_offer: string;
        last_message_at: string;
        other_user: User;
        posts_count: number;
        requires_response: boolean;
        responded: boolean;
        should_leave_review_reminder: boolean;
        should_translate: boolean;
        text_preview: string;
        user_thread_updated_at: string;
        users: Array<User>
    };

    type User = {
        'created_at': string;
        'first_name': string;
        'id': number;
        'picture_url': string;
    };
}

