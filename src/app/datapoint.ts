// data object containing an chart data
export class DataPoint {
    // country: string;
    date: string;
    confirmed: number;
    deaths: number;

    constructor(date: string, confirmed: number, deaths: number) {
        // this.country = country;
        this.date = date;
        this.confirmed = confirmed;
        this.deaths = deaths;
    }
}