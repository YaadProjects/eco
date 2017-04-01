export class Trips{
  public static trips = [];

  public static deleteTrip(id) : void {
    for(let i = 0; i < this.trips.length; i++){
      if(this.trips[i].id == id){
        this.trips.splice(i, 1);
      }
    }
  }


}
