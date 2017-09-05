import ListingInterface = Listings.ListingInterface;
import { AirApi } from "../api/air-api";
import Listing = Listings.Listing;

export class Listings implements ListingInterface {

    private _api: AirApi;

    constructor() {
        this._api = AirApi.Singleton;
    }

    async getAllListings(): Promise<Array<Listing>> {

        let res = await this._api.fetchAllListings();
        return res.listings;
    }
}
