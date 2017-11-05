export const Stage = process.env.OPT_STAGE as string;

export const enum MESSAGE_STATUS {
    ACCEPTED,
    INQUIRY,
    NOT_POSSIBLE,
    TIMEDOUT,
    MESSAGE
}

export const enum LANGUAGE {
    ENGLISH,
    KOREAN,
    CHINESE,
    THAI
}

export const MESSAGE_ROLE = {
    RESERVATIONS: 'reservations',
    UNREAD: 'unread'
};

export const MESSAGE_FORMAT = {
    FOR_WEB_INBOX: 'for_web_inbox',
    FOR_MESSAGING_SYNC: 'for_messaging_sync'
};

export const AIRBNB_API = {
    KEY: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
    ENDPOINTS: {
        HOST: 'api.airbnb.com',
        AUTH_PATH: '/v1/authorize',
        THREADS_PATH: '/v2/threads',
        RESERVATIONS_PATH: '/v2/reservations',
        MESSAGE_PATH: '/v2/messages',
        REPLY_PATH: '/messaging/qt_reply_v2',
        MULTI_CALENDAR: '/v2/calendars',
        LISTINGS_PATH: '/v2/listings?recommended_listing=true' //recommended_listing should be true always
    }
};

export const ACCOUNT = {
    ID: 'stardom8387@gmail.com',
    PW: 'Stardom84!',
    HOST_ID: 45188796
};

export const S3_BUCKET: Dict = {
    NAME: {
        dev: 'airbnb-manager-dev-serverlessdeploymentbucket-ee1rvm7afu76',
        prod: 'airbnb-manager-prod-serverlessdeploymentbucket-1od2xmlstig6r'
    }
};

export const LANGUAGE_UNICODE_REGEX: object = {
    CHINESE: /[\u3400-\u9FBF]/,
    KOREAN: /[\uAC00-\uD7AF]/,
    THAI: /[\u0E00-\u0E7F]/
};

export const HTTP_ERROR = {
    AUTH_ERROR: 'authentication_required'
};

export const DOCUMENT_ERROR = {
    MESSAGE: {
        MISSING: 'missing'
    },
    NAME: {
        NOT_FOUND: 'not_found'
    },
    REASON: {
        MISSING: 'missing'
    }
};

export const Tables = {
    dev: {
        TOKEN: 'AirbnbManagerToken-dev',
        THREADCOUNTS: 'AirbnbManagerThreadCounts-dev',
        RESPONSES: 'AirbnbManagerResponses-dev',
        RESERVATIONS: 'AirbnbManagerReservations-dev',
        BOOKINGS: 'Bookings-dev'
    },
    prod: {
        TOKEN: 'AirbnbManagerToken',
        THREADCOUNTS: 'AirbnbManagerThreadCounts',
        RESPONSES: 'AirbnbManagerResponses',
        RESERVATIONS: 'AirbnbManagerReservations',
        BOOKINGS: 'Bookings'
    }

} as { [key: string]: any };

export const UNIX_TIME = {
    DAY: 86400000
};

export const HOUSE_INFO: { [code: number]: any } = {
    16268602: {
        code: 1,
        wifi: {
            name: 'nui1',
            pw: '1234512345'
        },
        doorlock: '08031*'
    },
    16874939: {
        code: 2,
        wifi: {
            name: 'nui2',
            pw: '1234512345'
        },
        doorlock: '08032*'

    },
    17972084: {
        code: 3,
        wifi: {
            name: 'nui3',
            pw: '1234512345'
        },
        doorlock: '08033*'
    },
    18722790: {
        code: 4,
        wifi: {
            name: 'nui4',
            pw: '1234512345'
        },
        doorlock: '08034*'
    },
    19097139: {
        code: 5,
        wifi: {
            name: 'nui5',
            pw: '1234512345'
        },
        doorlock: '08035*'
    },
    20777226: {
        code: 6,
        wifi: {
            name: 'M & M Residence',
            pw: '1234567890'
        },
        doorlock: '4732*'
    },
    21170179: {
        code: 7,
        wifi: {
            name: 'nui7',
            pw: '1234512345'
        },
        doorlock: '08037*'
    }
};
