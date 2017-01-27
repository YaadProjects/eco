export class CarData{

  private static map: { [name: string]: ObdPid; } = { };
  private static loaded: boolean;
  public static pidList = [];

  public static addPids(){
    if(!CarData.loaded){
      //Will fill in with Bluetooth information later
      CarData.map["speed"] = new ObdPid("010D", true, "Engine", "Vehicle Speed", "mph", "speed");
      CarData.map["rpm"] = new ObdPid("010C", true, "Engine", "Engine RPM", "rpmx1000",  "rpm" );

      //Test!
      CarData.map["speed"].updateData(20);
      setInterval(function(ref){
        if(Math.random() > 0.5){
          ref.test_speed_up();
        }else{
          ref.test_speed_down();
        }
      }, 500, this);
      CarData.loaded = true;
    }
  }


  private static test_speed_up(){
    CarData.map["speed"].updateData(Math.round(CarData.map["speed"].getData() + (CarData.map["speed"].getData() * 0.5)));
    CarData.map["rpm"].updateData(((CarData.map["speed"].getData() / 180) * 8).toFixed(2));
  }

  private static test_speed_down(){
    CarData.map["speed"].updateData(Math.round(CarData.map["speed"].getData() - (CarData.map["speed"].getData() * 0.5)));
    CarData.map["rpm"].updateData(((CarData.map["speed"].getData() / 180) * 8).toFixed(2));
  }

  public static getPid(name: string) : ObdPid{
    return CarData.map[name] == null ? new ObdPid("NO_PIN", false, "NO_TYPE", "No Pin"): CarData.map[name];
  }
}

export class ObdPid{

  private pid: string;
  private data: any = 0;
  private available: boolean;
  private type: string;
  private name: string;
  private unit: string;

  constructor(pid: string, available: boolean, type: string, name: string, unit?: string, identifier?: string){
    this.pid = pid;
    this.available = available;
    this.type = type;
    this.name = name;
    if(identifier != null){
      CarData.pidList.push(identifier);
    }
    this.unit = unit;
  }

  updateData(data: any){
    this.data = data;
  }

  getData() : any{
    if(!this.available){
      throw Error("Attempted to get data off unavailable PID");
    }
    return this.data;
  }

  getFormattedData() : any{
    let append = "";
    if(this.unit != null){
      append += this.unit;
    }
    return this.getData() + " " + append;
  }

  getPid() : string{
    return this.pid;
  }

  isAvailable() : boolean{
    return this.available;
  }

  getType() : string {
    return this.type;
  }

  getName() : string{
    return this.name;
  }

}
