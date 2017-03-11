
export class PidDataProcess{

  //Default function
  private static defaultFunc(data, unit : string) : any{
    return (parseInt(data, 16)) + unit;
  }

  //Vehicle RPM
  private static _010C(data: string) : any {
    console.log("Called this method, data was: " + data);

    return (parseInt(data.replace(" ", ""), 16) / 4) + "rpm";
  }

  public static getData(pid: string, data: string, unit: string) : string{
    let func;
    switch(pid){
     case "010C": func = this._010C; break;
     default: func = this.defaultFunc; break;
    }
    return String(func(data.substring(6), unit));
  }
}
