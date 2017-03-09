import { BLE } from 'ionic-native';

export class Bluetooth{

  public static uuid : string = null;
  public static device : any = null;
  private static notificationStarted : boolean = false;

  private static notificationPairing = []


  public static writeToUUID(cmd: string) : void{
    Bluetooth.notificationPairing.push({"command" : cmd, "value" : null});
    BLE.write(Bluetooth.uuid, "fff0", "fff2", Bluetooth.stringToBytes(cmd)).catch(err => {
      console.log("Error while writing: " + err);
    });
  }

  public static startNotification() : void {
    if(!Bluetooth.notificationStarted){
      BLE.startNotification(Bluetooth.uuid, "fff0", "fff1").subscribe(d => {
        let data = Bluetooth.bytesToString(d);
        for(let i = 0; i < Bluetooth.notificationPairing.length; i++){
          if(Bluetooth.notificationPairing[i].value == null){
            Bluetooth.notificationPairing[i].value = data;
            console.log("Paired: " + JSON.stringify(Bluetooth.notificationPairing[i]));
            return;
          }
        }
        console.log("Threw away value: " + data);
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
