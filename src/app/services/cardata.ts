export class CarData{

  private static map: { [name: string]: ObdPid; } = { };
  private static loaded: boolean;
  public static pidList = [];

  public static addPids(){
    if(!CarData.loaded){
      //Will fill in with Bluetooth information later
      CarData.map["calculatedEngineLoad"] = new ObdPid("0104", true, "Engine", "Engine Load", "%", "calculatedEngineLoad")
      CarData.map["engineCoolantTemperature"] = new ObdPid("0105", true, "Engine", "Engine Coolant Temperature", "°C", "engineCoolantTemperature")
      CarData.map["shortTermFuelTrim1"] = new ObdPid("0106", true, "Fuel", "Short Term Fuel Trim - Bank 1", "%", "shortTermFuelTrim1")
      CarData.map["longTermFuelTrim1"] = new ObdPid("0107", true, "Fuel", "Long Term Fuel Trim - Bank 1", "%", "longTermFuelTrim1")
      CarData.map["shortTermFuelTrim2"] = new ObdPid("0108", true, "Fuel", "Short Term Fuel Trim - Bank 2", "%", "shortTermFuelTrim2")
      CarData.map["longTermFuelTrim2"] = new ObdPid("0109", true, "Fuel", "Long Term Fuel Trim - Bank 2", "%", "longTermFuelTrim2")
      CarData.map["fuelPressure"] = new ObdPid("010A", true, "Fuel", "Fuel Pressure", "kPa", "fuelPressure")
      CarData.map["intakeManifoldAbsolutePressure"] = new ObdPid("010B", true, "Engine", "Intake Manifold Absolute Pressure", "kPa", "intakeManifoldAbsolutePressure")
      CarData.map["engineRPM"] = new ObdPid("010C", true, "Engine", "Engine RPM", "rpm", "engineRPM")
      CarData.map["vehicleSpeed"] = new ObdPid("010D", true, "Engine", "Vehicle Speed", "km/h", "vehicleSpeed")
      CarData.map["timingAdvance"] = new ObdPid("010E", true, "Engine", "Timing Advance", "° before TDC", "timingAdvance")
      CarData.map["intakeAirTemperature"] = new ObdPid("010F", true, "Engine", "Intake Air Temperature", "°C", "intakeAirTemperature")
      CarData.map["mafAirFlowRate"] = new ObdPid("0110", true, "Engine", "Mass Air Flow", "grams/sec", "mafAirFlowRate")
      CarData.map["throttlePosition"] = new ObdPid("0111", true, "General", "Throttle Position", "%", "throttlePosition")
      CarData.map["runTimeSinceEngineStart"] = new ObdPid("011F", true, "General", "Time Since Engine Start", "seconds", "runTimeSinceEngineStart")
      CarData.map["distanceTraveledWithMalfunction"] = new ObdPid("0121", true, "General", "Distance traveled with Engine Malfunction Light", "km", "distanceTraveledWithMalfunction")
      CarData.map["fuelRailPressure"] = new ObdPid("0122", true, "Fuel", "Fuel Rail Pressure", "kPa", "fuelRailPressure")
      CarData.map["fuelRailGuagePressure"] = new ObdPid("0123", true, "Fuel", "Fuel Rail Gauge Pressure", "kPa", "fuelRailGuagePressure")
      CarData.map["commandedEGR"] = new ObdPid("012C", true, "Exhaust", "Exhaust Gas Recirculation Valve", "%", "commandedEGR")
      CarData.map["exhaustGasRecirculationError"] = new ObdPid("012D", true, "Exhaust", "Error in Exhaust Gas Recirculation System", "%", "exhaustGasRecirculationError")

      //Test!
      CarData.map["vehicleSpeed"].updateData(20);
      CarData.map["engineRPM"].updateData(800);
      CarData.loaded = true;
    }
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
  private iUnit: string;
  private iFunction: Function;

  constructor(pid: string, available: boolean, type: string, name: string, unit?: string, identifier?: string, iUnit?: string, iFunction?: Function){
    this.pid = pid;
    this.available = available;
    this.type = type;
    this.name = name;
    if(identifier != null){
      CarData.pidList.push(identifier);
    }
    this.iUnit = iUnit;
    this.iFunction = iFunction;
    this.unit = unit;
  }

  updateData(data: any){
    this.data = data;
  }

  getData() : any{
    if(!this.available){
      throw Error("Attempted to get data off unavailable PID");
    }
    if(this.iFunction != null){ //TODO Add a check for a boolean to switch to metric
      return this.iFunction(this.data);
    }
    return this.data;
  }

  getFormattedData() : any{
    let append = "";
    if(this.unit != null){
      append += (this.iFunction != null ? this.iUnit : this.unit);
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
