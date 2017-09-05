declare namespace Listings {
    interface ListingInterface {
        getAllListings(): Promise<Array<Listing>>;
    }

    type ListingResponse = {
        listings: Array<Listing>,
        metadata: Metadata
    };

    type Metadata = {
        listing_count: number;
        listings_type: "recently_viewed_listings";
        record_count: number;
        translated_listings_type: "Recently viewed"
    }

    type Listing = {
        id: number;
        listing_descriptions: Array<description>;
        name: string;
        reviews_count: number;
    }

    type description = {
        access: string;
        author_type: string;
        description: string;
        house_rules: string;
        interaction: string;
        locale: string;
        localized_language_name: string;
        name: string;
        neighborhood_overview: string;
        notes: string;
        space: string;
        summary: string;
        transit: string;
    }
}