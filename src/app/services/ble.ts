import { BLE } from 'ionic-native';

export class Bluetooth{

  public static uuid : string = null;
  public static device : any = null;
  public static adapterInit = false;

  private static notificationStarted : boolean = false;
  private static notificationPairing = []
  private static cmdId = 0;
  private static debugMode = true; //Turns off 7 second setTimeout to allow more time to debug

  private static cmdQueue = [];

  public static writeToUUID(cmd: string) : Promise<string>{
    let cmdId = Bluetooth.cmdId;
    Bluetooth.notificationPairing.push({"command" : cmd, "value" : null, "id" : cmdId});
    this.cmdQueue.push({command : cmd, id: cmdId});
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
      }, 150);
    });
  }

  private static startSend() : void{
    setInterval(() => {
      if(this.cmdQueue.length > 0){
        let obj = this.cmdQueue.shift();
        let cmd = obj.command;
        console.log("Sent " + cmd + " to adapter");
        BLE.write(Bluetooth.uuid, "fff0", "fff2", Bluetooth.stringToBytes(cmd)).catch(err => {
          console.log("Error while writing: " + err);
        });
      }
    }, 500);
  }

  public static startNotification() : void{
    this.startSend();
    if(!Bluetooth.notificationStarted){
      BLE.startNotification(Bluetooth.uuid, "fff0", "fff1").subscribe(d => {
        let data = Bluetooth.bytesToString(d);

        if(data.lastIndexOf("41", 0) === 0){
          let pid = data.trim().split(" ")[1];
          //This is a response as a result of a PID. Find the first PID without a value that matches
          for(let i = 0; i < Bluetooth.notificationPairing.length; i++){
            let pairing = Bluetooth.notificationPairing[i];
            if(pairing.value == null && pairing.command.includes("01" + pid)){
              Bluetooth.notificationPairing[i].value = data;
              console.log("Paired for PID: " + JSON.stringify(Bluetooth.notificationPairing[i]));
              return;
            }
          }
          console.log("Threw away PID data: " + data);
        }else{
          for(let i = 0; i < Bluetooth.notificationPairing.length; i++){
            let pairing = Bluetooth.notificationPairing[i];
            if(pairing.value == null && pairing.command != data && !pairing.command.includes("01")){ //No same value, and no pid pairing with regular data
              Bluetooth.notificationPairing[i].value = data;
              console.log("Paired with regular data: " + JSON.stringify(Bluetooth.notificationPairing[i]));
              return;
            }
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
