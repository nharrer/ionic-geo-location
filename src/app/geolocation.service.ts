import { Injectable } from '@angular/core';
import { CallbackID, Geolocation, Position } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular/standalone';
import { BehaviorSubject, concatMap, from, of, tap } from 'rxjs';

export class Coords {
    // initial fake coords
    public lat = 0;
    public long = 0;
    public accuracy = 0;
    public timestamp = +(new Date());
    public exist = false;
}

@Injectable({
    providedIn: 'root'
})
export class GeolocationService {
    private coordsSubject = new BehaviorSubject<Coords>(new Coords());  // new subscriptions always gets the last known coords right away
    public coords$ = this.coordsSubject.asObservable();
    public logs: Array<string> = [];

    private callbackId: CallbackID | null = null;

    constructor(
        private platform: Platform
    ) {
        this.init();
    }

    public init() {
        from(this.platform.ready()).subscribe(() => {
            of(1).pipe(
                tap(_ => console.log('GeolocationService', 'init', 'calling geolocation.watchPosition()')),
                concatMap(_ => from(Geolocation.watchPosition(
                    { enableHighAccuracy: true },
                    (position: Position | null, err: any) => {
                        this.handleGeocallback(position, err);
                    }))
                )
            ).subscribe((id: CallbackID) => {
                this.callbackId = id;
                console.log('GeolocationService', 'init', `done geolocation.watchPosition(): id=${id}`);
            });
        });
    }

    private handleGeocallback(position: Position | null, error: any): void {
        this.log(`GeolocationService handleGeocallbackCoords position: ${JSON.stringify(position)}, error: ${JSON.stringify(error)}`);

        if (position && position.coords && position.coords.latitude) {
            const coords = new Coords();
            coords.lat = position.coords.latitude;
            coords.long = position.coords.longitude;
            coords.accuracy = position.coords.accuracy;
            coords.timestamp = position.timestamp;
            coords.exist = true;

            // Emit the updated coordinates
            this.coordsSubject.next(coords);
        }
    }

    private log(msg: string): void {
        this.logs.push(msg);
        console.log(msg);
    }
}
