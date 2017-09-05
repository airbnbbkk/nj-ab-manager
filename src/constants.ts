export const Stage = process.env.OPT_STAGE;

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
}

export const MESSAGE_FORMAT = {
    FOR_WEB_INBOX: 'for_web_inbox',
    FOR_MESSAGING_SYNC: 'for_messaging_sync'
}


export const AIRBNB_API = {
    KEY: 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
    ENDPOINTS: {
        HOST: 'https://api.airbnb.com/',
        AUTH_PATH: 'v1/authorize',
        THREADS_PATH: 'v2/threads',
        RESERVATIONS_PATH: 'v2/reservations',
        MESSAGE_PATH: 'v2/messages',
        REPLY_PATH: 'messaging/qt_reply_v2/',
        LISTINGS_PATH: 'v2/listings?recommended_listing=true' //recommended_listing should be true always
    }
};

export const ACCOUNT = {
    ID: 'stardom8387@gmail.com',
    PW: 'Stardom84!',
    HOST_ID: 45188796
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

export const Tables = <{ [key: string]: any } > {
    dev: {
        AirbnbManagerToken: "AirbnbManagerToken-dev",
        AirbnbManagerThreadCounts: "AirbnbManagerThreadCounts-dev",
        AirbnbManagerResponses: "AirbnbManagerResponses-dev"
    },
    prod: {
        AirbnbManagerToken: "AirbnbManagerToken",
        AirbnbManagerThreadCounts: "AirbnbManagerThreadCounts",
        AirbnbManagerResponses: "AirbnbManagerResponses"
    }

};