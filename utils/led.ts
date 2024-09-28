import { Device } from "react-native-ble-plx";
import { Transmission } from "./transmission";
import { Operation, Scene, TimerTask } from "@/types";
import { TimeTask } from "@/stores/useTimeTaskStore";
import { uint8ArrayToBase64 } from "./parse";

export class Led {
  public sceneTransmission: Transmission<Scene>;
  public timeTaskTransmission: Transmission<TimeTask[], TimerTask>;
  private controlUuid = "bc00dad8-280c-49f9-9efd-3a8137594ef2";
  private stateUuid = "e192efae-9626-4767-8a27-b96cb9753e10";
  private timeUuid = "9ae95835-6543-4bd0-8aec-6c48fe9fd989";
  private serviceUUID = "e572775c-0df9-4b44-926b-b692e31d6971";

  constructor(public device: Device) {
    this.sceneTransmission = new Transmission(
      device,
      this.serviceUUID,
      "c7d7ee2f-c84b-4f5c-a2a4-e642c97a880d"
    );

    this.timeTaskTransmission = new Transmission(
      device,
      this.serviceUUID,
      "f144af69-9642-97e1-d712-9448d1b450a1"
    );

    this.synchronousTime();
  }

  async control(operation: Operation) {
    return await this.device.writeCharacteristicWithResponseForService(
      this.serviceUUID,
      this.controlUuid,
      btoa(operation)
    );
  }

  onState(callback: (state: "opened" | "closed") => void) {
    return this.device.monitorCharacteristicForService(
      this.serviceUUID,
      this.stateUuid,
      (error, characteristic) => {
        if (characteristic?.value) {
          callback(atob(characteristic.value) as "opened" | "closed");
        }
      }
    );
  }

  async getState() {
    const { value } = await this.device.readCharacteristicForService(
      this.serviceUUID,
      this.stateUuid
    );
    if (!value) {
      throw new Error("获取状态失败");
    }
    return atob(value) as "opened" | "closed";
  }

  // 同步时间
  private synchronousTime() {
    const now = Date.now();
    const uint8Array = new Uint8Array(8);
    new DataView(uint8Array.buffer).setBigUint64(0, BigInt(now));

    return this.device.writeCharacteristicWithResponseForService(
      this.serviceUUID,
      this.timeUuid,
      uint8ArrayToBase64(uint8Array)
    );
  }
}
