export class PidDataProcess{

  public static useImperialUnits: boolean;

  //Default function
  private static defaultFunc(data) : any{
    return (parseInt(data.replace(" ", ""), 16));
  }

  //Vehicle RPM
  private static _010C(data: string) : any {
    return (parseInt(data.replace(" ", ""), 16) / 4);
  }

  public static getData(pid: string, data: string, unit: string, iUnit?: string, iUnitConvert?: Function) : string{
    let func;
    switch(pid){
     case "010C": func = this._010C; break;
     default: func = this.defaultFunc; break;
    }

    if(PidDataProcess.useImperialUnits && iUnitConvert != null){
      return String(iUnitConvert(func(data.substring(6))) + iUnit);
    }else{
      return String(func(data.substring(6)) + unit);
    }
  }
}
