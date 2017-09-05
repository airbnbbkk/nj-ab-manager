declare namespace Authorizer {
    interface Authorizer {
        getClient: () => Promise<any>;
    }

    type TokenResponse = {
        access_token: string;
        generated: string;
    };

    type Token = {
        token: string;
        isValid: boolean;
    };

    type TokenDocument = any;
}