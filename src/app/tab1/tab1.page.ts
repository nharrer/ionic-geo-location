import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Coords, GeolocationService } from '../geolocation.service';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule],
})
export class Tab1Page implements OnInit, OnDestroy {
  public coords: Coords | null = null;
  public elapsed = NaN;
  private intervalId: any;

  constructor(
    public geolocationService: GeolocationService,
  ) {
    this.geolocationService.coords$.subscribe((coords: Coords) => {
      this.coords = coords;
    });
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      if (this.coords) {
        const timestamp = this.coords.timestamp;
        const now = Date.now(); // current time in milliseconds
        const elapsedMilliseconds = now - timestamp;
        const elapsedSeconds = elapsedMilliseconds / 1000.0;
        this.elapsed = elapsedSeconds;
      }
    }, 1000); // update every second
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
