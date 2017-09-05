declare namespace AirApi {
    interface Api {
        getThreads(): Promise<Array<any>>;
        getReservations(): Promise<Array<any>>;
    }

    type message = {
        message: string;
        thread_id: number;
    };
}
