import { Storage } from '@ionic/storage';

export class Trips{
  public static trips = [];

  public static deleteTrip(id) : void {
    for(let i = 0; i < this.trips.length; i++){
      if(this.trips[i].id == id){
        this.trips.splice(i, 1);
      }
    }
  }

  public static update(trip: any){
    for(let i = 0; i < this.trips.length; i++){
      if(this.trips[i].id == trip.id){
        this.trips[i] = trip;
      }
    }
  }


  public static loadFromStorage(storage: Storage) : Promise<void> {
    return new Promise<void>((resolve, reject)=>{
      storage.ready().then(() => {
        storage.get("trips").then(data => {
          if(data == null){
            this.trips = [];
          }else{
            this.trips = JSON.parse(data).trips;
          }
          resolve();
        }).catch(err => {
          this.trips = [];
          reject(err);
        });
      })
    });
  }

  public static storeToStorage(storage: Storage) : Promise<void> {
    return new Promise<void>((resolve, reject)=>{
      storage.ready().then(() => {
        storage.set("trips", JSON.stringify({trips: this.trips})).then(() => {
          resolve();
        }).catch(err => {
          reject(err);
        });
      });
    });
  }

}
