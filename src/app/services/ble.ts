import { BLE } from 'ionic-native';

export class Bluetooth{

  public static uuid : string = null;
  public static device : any = null;
  public static adapterInit = false;

  private static notificationStarted : boolean = false;
  private static notificationPairing = []
  private static cmdId = 0;
  private static debugMode = true; //Turns off 7 second setTimeout to allow more time to debug

  public static writeToUUID(cmd: string) : Promise<string>{
    let cmdId = Bluetooth.cmdId;
    console.log("Sent " + cmd + " to adapter");
    Bluetooth.notificationPairing.push({"command" : cmd, "value" : null, "id" : cmdId});
    BLE.write(Bluetooth.uuid, "fff0", "fff2", Bluetooth.stringToBytes(cmd)).catch(err => {
      console.log("Error while writing: " + err);
    });
    Bluetooth.cmdId += 1;

    return new Promise((resolve, reject)=>{
      let timeoutTimer = null;
      if(!Bluetooth.debugMode){
        timeoutTimer = setTimeout(() => {
          clearInterval(timer);
          reject(new Error("Adapter did not respond in time for command " + cmd))
        }, 7000);
      }
      let timer = setInterval(() => {
        for(let i = 0; i < Bluetooth.notificationPairing.length; i++){
          if(Bluetooth.notificationPairing[i].id == cmdId && Bluetooth.notificationPairing[i].value != null){
            if(timeoutTimer != null){
              clearTimeout(timeoutTimer);
            }
            clearInterval(timer);
            resolve(Bluetooth.notificationPairing[i].value);
          }
        }
      }, 500);
    });
  }

  public static startNotification() : void{
    if(!Bluetooth.notificationStarted){
      BLE.startNotification(Bluetooth.uuid, "fff0", "fff1").subscribe(d => {
        let data = Bluetooth.bytesToString(d);
        for(let i = 0; i < Bluetooth.notificationPairing.length; i++){
          if(Bluetooth.notificationPairing[i].value == null && Bluetooth.notificationPairing[i].command != data){
            Bluetooth.notificationPairing[i].value = data;
            console.log("Paired: " + JSON.stringify(Bluetooth.notificationPairing[i]));
            return;
          }
        }
      });
      Bluetooth.notificationStarted = true;
    }
  }


  public static stringToBytes(string :string) : ArrayBuffer{
      var array = new Uint8Array(string.length);
      for (var i = 0, l = string.length; i < l; i++) {
         array[i] = string.charCodeAt(i);
      }
      return array.buffer;
  }

  public static bytesToString(buffer) : string{
      return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

}
