export class CarData{

  private static map: { [name: string]: ObdPid; } = { };
  private static loaded: boolean;
  public static pidList = [];

  public static addPids(){
    if(!CarData.loaded){
      //Will fill in with Bluetooth information later
      CarData.map["fuelSystemStatus"] = new ObdPid("0103", this.isPidAvailable("0103"), "Fuel", "Engine Fuel Status", "", "fuelSystemStatus"," ", val => this.getFuelSystemStatus(val));      CarData.map["calculatedEngineLoad"] = new ObdPid("0104", this.isPidAvailable("0104"), "Engine", "Engine Load", "%", "calculatedEngineLoad");
      CarData.map["engineCoolantTemperature"] = new ObdPid("0105", this.isPidAvailable("0105"), "Engine", "Engine Coolant Temperature", "°C", "engineCoolantTemperature","°F", val => (val * 1.5) + 32);
      CarData.map["shortTermFuelTrim1"] = new ObdPid("0106", this.isPidAvailable("0106"), "Fuel", "Short Term Fuel Trim - Bank 1", "%", "shortTermFuelTrim1");
      CarData.map["longTermFuelTrim1"] = new ObdPid("0107", this.isPidAvailable("0107"), "Fuel", "Long Term Fuel Trim - Bank 1", "%", "longTermFuelTrim1");
      CarData.map["shortTermFuelTrim2"] = new ObdPid("0108", this.isPidAvailable("0108"), "Fuel", "Short Term Fuel Trim - Bank 2", "%", "shortTermFuelTrim2");
      CarData.map["longTermFuelTrim2"] = new ObdPid("0109", this.isPidAvailable("0109"), "Fuel", "Long Term Fuel Trim - Bank 2", "%", "longTermFuelTrim2");
      CarData.map["fuelPressure"] = new ObdPid("010A", this.isPidAvailable("010A"), "Fuel", "Fuel Pressure", "kPa", "fuelPressure","psi", val => (val * 0.145));
      CarData.map["intakeManifoldAbsolutePressure"] = new ObdPid("010B", this.isPidAvailable("010B"), "Engine", "Intake Manifold Absolute Pressure", "kPa", "intakeManifoldAbsolutePressure","psi", val => (val * 0.145));
      CarData.map["engineRPM"] = new ObdPid("010C", this.isPidAvailable("010C"), "Engine", "Engine RPM", "rpm", "engineRPM");
      CarData.map["vehicleSpeed"] = new ObdPid("010D", this.isPidAvailable("010D"), "Engine", "Vehicle Speed", "km/h", "vehicleSpeed","mph", val => (val * 0.621));
      CarData.map["timingAdvance"] = new ObdPid("010E", this.isPidAvailable("010E"), "Engine", "Timing Advance", "° before TDC", "timingAdvance");
      CarData.map["intakeAirTemperature"] = new ObdPid("010F", this.isPidAvailable("010F"), "Engine", "Intake Air Temperature", "°C", "intakeAirTemperature","°F", val => (val * 1.5) + 32);
      CarData.map["mafAirFlowRate"] = new ObdPid("0110", this.isPidAvailable("0110"), "Engine", "Mass Air Flow", "grams/sec", "mafAirFlowRate");
      CarData.map["throttlePosition"] = new ObdPid("0111", this.isPidAvailable("0111"), "General", "Throttle Position", "%", "throttlePosition");
      CarData.map["runTimeSinceEngineStart"] = new ObdPid("011F", this.isPidAvailable("011F"), "Diagnostics", "Time Since Engine Start", "seconds", "runTimeSinceEngineStart");
      CarData.map["distanceTraveledWithMalfunction"] = new ObdPid("0121", this.isPidAvailable("0121"), "Diagnostics", "Distance Traveled with MIL", "km", "distanceTraveledWithMalfunction","miles", val => (val * 0.621));
      CarData.map["fuelRailPressure"] = new ObdPid("0122", this.isPidAvailable("0122"), "Fuel", "Fuel Rail Pressure", "kPa", "fuelRailPressure","psi", val => (val * 0.145));
      CarData.map["fuelRailGuagePressure"] = new ObdPid("0123", this.isPidAvailable("0123"), "Fuel", "Fuel Rail Gauge Pressure", "kPa", "fuelRailGuagePressure","psi", val => (val * 0.145));
      CarData.map["commandedEGR"] = new ObdPid("012C", this.isPidAvailable("012C"), "Exhaust", "Exhaust Gas Recirculation Valve", "%", "commandedEGR");
      CarData.map["exhaustGasRecirculationError"] = new ObdPid("012D", this.isPidAvailable("012D"), "Exhaust", "EGR Error", "", "exhaustGasRecirculationError");
      CarData.map["commandedEvaporativePurge"] = new ObdPid("012E", this.isPidAvailable("012E"), "Fuel", "Commanded Evaporative Purge", "%", "commandedEvaporativePurge");
      CarData.map["fuelTankLevelInput"] = new ObdPid("012F", this.isPidAvailable("012F"), "Fuel", "Fuel Tank Level", "%", "fuelTankLevelInput");
      CarData.map["warmupsSinceCodesClear"] = new ObdPid("0130", this.isPidAvailable("0130"), "Diagnostics", "Warm-Ups Since Cleared Codes", "count", "warmupsSinceCodesClear");
      CarData.map["distanceTraveledSinceCodesClear"] = new ObdPid("0131", this.isPidAvailable("0131"), "Diagnostics", "Distance Traveled Since Cleared Codes", "km", "distanceTraveledSinceCodesClear","miles", val => (val * 0.621));
      CarData.map["evaporationSystemVaporPressure"] = new ObdPid("0132", this.isPidAvailable("0132"), "Fuel", "Evap. System Vapor Pressure", "Pa", "evaporationSystemVaporPressure");
      CarData.map["absoluteBarometricPressure"] = new ObdPid("0133", this.isPidAvailable("0133"), "General", "Barometric Pressure", "kPa", "absoluteBarometricPressure","psi", val => (val * 0.145));
      CarData.map["catalystTemperatureB1S1"] = new ObdPid("013C", this.isPidAvailable("013C"), "Engine", "Catalyst Temperature Bank 1 Sensor 1", "°C", "catalystTemperatureB1S1","°F", val => (val * 1.5) + 32);
      CarData.map["catalystTemperatureB2S1"] = new ObdPid("013D", this.isPidAvailable("013D"), "Engine", "Catalyst Temperature Bank 2 Sensor 1", "°C", "catalystTemperatureB2S1","°F", val => (val * 1.5) + 32);
      CarData.map["catalystTemperatureB1S2"] = new ObdPid("013E", this.isPidAvailable("013E"), "Engine", "Catalyst Temperature Bank 1 Sensor 2", "°C", "catalystTemperatureB1S2","°F", val => (val * 1.5) + 32);
      CarData.map["catalystTemperatureB2S2"] = new ObdPid("013F", this.isPidAvailable("013F"), "Engine", "Catalyst Temperature Bank 2 Sensor 2", "°C", "catalystTemperatureB2S2","°F", val => (val * 1.5) + 32);
      CarData.map["controlModuleVoltage"] = new ObdPid("0142", this.isPidAvailable("0142"), "General", "Control Module Voltage", "V", "controlModuleVoltage");
      CarData.map["absoluteLoadValue"] = new ObdPid("0143", this.isPidAvailable("0143"), "Engine", "Absolute Load Value", "%", "absoluteLoadValue");
      CarData.map["fuelairCommandedRatio"] = new ObdPid("0144", this.isPidAvailable("0144"), "Fuel", "Commanded Fuel-Air Ratio", "ratio", "fuelairCommandedRatio");
      CarData.map["relativeThrottlePosition"] = new ObdPid("0145", this.isPidAvailable("0145"), "General", "Relative Throttle Position", "%", "relativeThrottlePosition");
      CarData.map["ambientAirTemperature"] = new ObdPid("0146", this.isPidAvailable("0146"), "General", "Ambient Air Temperature", "°C", "ambientAirTemperature","°F", val => (val * 1.5) + 32);
      CarData.map["absoluteThrottlePositionB"] = new ObdPid("0147", this.isPidAvailable("0147"), "Accelerator", "Absolute Throttle Position B", "%", "absoluteThrottlePositionB");
      CarData.map["absoluteThrottlePositionC"] = new ObdPid("0148", this.isPidAvailable("0148"), "Accelerator", "Abosolute Throttle Position C", "%", "absoluteThrottlePositionC");
      CarData.map["acceleratorPedalPositionD"] = new ObdPid("0149", this.isPidAvailable("0149"), "Accelerator", "Accelerator Pedal Position D", "%", "acceleratorPedalPositionD");
      CarData.map["acceleratorPedalPositionE"] = new ObdPid("014A", this.isPidAvailable("014A"), "Accelerator", "Accelerator Pedal Position E", "%", "acceleratorPedalPositionE");
      CarData.map["acceleratorPedalPositionF"] = new ObdPid("014B", this.isPidAvailable("014B"), "Accelerator", "Accelerator Pedal Position F", "%", "acceleratorPedalPositionF");
      CarData.map["commandedThrottleActuator"] = new ObdPid("014C", this.isPidAvailable("014C"), "Accelerator", "Commanded Throttle Actuator", "%", "commandedThrottleActuator");
      CarData.map["timeRunWithMalfunction"] = new ObdPid("014D", this.isPidAvailable("014D"), "Diagnostics", "Time Since MIL On", "minutes", "timeRunWithMalfunction");
      CarData.map["timeSinceLastCodesCleared"] = new ObdPid("014E", this.isPidAvailable("014E"), "Diagnostics", "Time Since Trouble Codes Cleared", "minutes", "timeSinceLastCodesCleared");
      CarData.map["maxValueAirFlowRateFromMAF"] = new ObdPid("0150", this.isPidAvailable("0150"), "Engine", "Maximum Value of Air Flow Rate for MAF", "g/s", "maxValueAirFlowRateFromMAF");
      CarData.map["fuelType"] = new ObdPid("0151", this.isPidAvailable("0151"), "Fuel", "Fuel Type", "", "fuelType"," ", val => this.getFuelString(val));
      CarData.map["ethanolFuel"] = new ObdPid("0152", this.isPidAvailable("0152"), "Fuel", "Ethanol Fuel %", "%", "ethanolFuel");
      CarData.map["absoluteEvapSystemVaporPressure"] = new ObdPid("0153", this.isPidAvailable("0153"), "Fuel", "Absolute Evap. System Vapor Pressure", "kPa", "absoluteEvapSystemVaporPressure","psi", val => (val * 0.145));
      CarData.map["evapSystemVaporPressure"] = new ObdPid("0154", this.isPidAvailable("0154"), "Fuel", "Evap. System Vapor Pressure", "Pa", "evapSystemVaporPressure");
      CarData.map["fuelRailAbsolutePressure"] = new ObdPid("0159", this.isPidAvailable("0159"), "Fuel", "Fuel Rail Absolute Pressure", "kPa", "fuelRailAbsolutePressure","psi", val => (val * 0.145));
      CarData.map["relativeAcceleratorPedalPosition"] = new ObdPid("015A", this.isPidAvailable("015A"), "Accelerator", "Relative Accelerator Pedal Position", "%", "relativeAcceleratorPedalPosition");
      CarData.map["hybridBatteryRemainingLife"] = new ObdPid("015B", this.isPidAvailable("015B"), "Fuel", "Hybrid Battery Remaining Life", "%", "hybridBatteryRemainingLife");
      CarData.map["engineOilTemperature"] = new ObdPid("015C", this.isPidAvailable("015C"), "Engine", "Engine Oil Temperature", "°C", "engineOilTemperature","°F", val => (val * 1.5) + 32);
      CarData.map["fuelInjectionTiming"] = new ObdPid("015D", this.isPidAvailable("015D"), "Fuel", "Fuel Injection Timing", "°", "fuelInjectionTiming");
      CarData.map["engineFuelRate"] = new ObdPid("015E", this.isPidAvailable("015E"), "Fuel", "Engine Fuel Rate", "L/h", "engineFuelRate","G/h", val => (val * 0.264));
      CarData.map["driversDemandEngineTorque"] = new ObdPid("0161", this.isPidAvailable("0161"), "Engine", "Driver Demanded Torque", "%", "driversDemandEngineTorque");
      CarData.map["actualEngineTorque"] = new ObdPid("0162", this.isPidAvailable("0162"), "Engine", "Engine Torque", "%", "actualEngineTorque");
      CarData.map["engineReferenceTorque"] = new ObdPid("0163", this.isPidAvailable("0163"), "Engine", "Engine Reference Torque", "Nm", "engineReferenceTorque","ft/lb", val => (val * 0.737));
      CarData.map["enginePercentTorqueData"] = new ObdPid("0164", this.isPidAvailable("0164"), "Engine", "Engine Perent Torque Data", "%", "enginePercentTorqueData");

      //Test!
      CarData.map["fuelType"].updateData(1);
      CarData.map["fuelSystemStatus"].updateData(1);
      CarData.map["vehicleSpeed"].updateData(20);
      CarData.map["engineRPM"].updateData(800);
      CarData.loaded = true;
    }
  }

  public static getPid(name: string) : ObdPid{
    return CarData.map[name] == null ? new ObdPid("NO_PIN", false, "NO_TYPE", "No Pin"): CarData.map[name];
  }

  public static isPidAvailable(pid: string) : boolean{
    return true;
  }


  public static getFuelSystemStatus(id: any) : string{
    let check = String(id);
    switch(check){
      case "1":
        return "Open loop / insufficient engine temperature";
      case "2":
        return "Closed loop / using oxygen sensor feedback to determine fuel mix";
      case "4":
        return "Open loop / due to engine load OR fuel cut due to deceleration"
      case "8":
        return "Open loop / due to system failure";
      case "16":
        return "Closed loop / using at least one oxygen sensor but there is a fault in the feedback system";
      default:
        return "Problem with values";
    }
  }

  public static getFuelString(id: any): string{
    let check = String(id)
    switch(check){
      case "0":
        return "Not available";
      case "1":
        return "Gasoline";
      case "2":
        return "Methanol";
      case "3":
        return "Ethanol";
      case "4":
        return "Diesel";
      case "5":
        return "LPG";
      case "6":
        return "CNG";
      case "7":
        return "Propane";
      case "8":
        return "Electric";
      case "20":
        return "Hybrid Electric";
      default:
        return "Other";
    }
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
    return this.getData() + (this.unit.includes("%") || this.unit.includes("°") ? "" : " ") + append;
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
