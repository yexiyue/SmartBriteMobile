import { Device } from "react-native-ble-plx";
import { ChunkMetaData, MetaData } from "./metaData";
import { base64ToUint8Array, fastTextDecode, fastTextEncode } from "./parse";
import { base64ToNotifyMessage, readMessageToBase64 } from "./readMessage";

export class Transmission<T extends Record<any, any>, W = T> {
  constructor(
    public device: Device,
    public serviceUUID: string,
    public characteristicUUID: string
  ) {}

  read(): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.device.monitorCharacteristicForService(
        this.serviceUUID,
        this.characteristicUUID,
        async (error, characteristic) => {
          if (error) {
            reject(error);
          }
          if (characteristic?.value) {
            const message = base64ToNotifyMessage(characteristic.value);
            if (message.type === "ReadReady") {
              const meta = message.meta;
              const uint8Array = new Uint8Array(meta.totalSize);
              while (true) {
                const { value } =
                  await this.device.readCharacteristicForService(
                    this.serviceUUID,
                    this.characteristicUUID
                  );

                if (value) {
                  const [chunkMeta, data] = ChunkMetaData.fromData(
                    base64ToUint8Array(value)
                  );
                  if (
                    meta.id === chunkMeta.id &&
                    data.byteLength === chunkMeta.chunkSize
                  ) {
                    uint8Array.set(data, chunkMeta.start);
                    const nextStart = uint8Array.byteLength;
                    if (nextStart >= meta.totalSize) {
                      await this.device.writeCharacteristicWithoutResponseForService(
                        this.serviceUUID,
                        this.characteristicUUID,
                        readMessageToBase64({ type: "ReadFinish" })
                      );
                      resolve(JSON.parse(fastTextDecode(uint8Array)));
                      break;
                    } else {
                      await this.device.writeCharacteristicWithoutResponseForService(
                        this.serviceUUID,
                        this.characteristicUUID,
                        readMessageToBase64({
                          type: "ReadReceive",
                          nextStart,
                        })
                      );
                    }
                  }
                }
              }
            }
          }
        }
      );

      this.device
        .writeCharacteristicWithoutResponseForService(
          this.serviceUUID,
          this.characteristicUUID,
          readMessageToBase64({ type: "StartRead" })
        )
        .catch(reject);
    });
  }

  write(data: W) {
    return new Promise<boolean>((resolve, reject) => {
      const dataBytes = fastTextEncode(JSON.stringify(data));
      const id = Math.round(Math.random() * 10000);
      const meta = new MetaData(id, dataBytes.byteLength);
      let mtu = 32;

      this.device.monitorCharacteristicForService(
        this.serviceUUID,
        this.characteristicUUID,
        async (error, characteristic) => {
          if (error) {
            reject(error);
          }
          if (characteristic?.value) {
            const message = base64ToNotifyMessage(characteristic.value);
            if (message.type === "WriteReady") {
              mtu = message.mtu;
              const chunkSize = Math.min(mtu - 12, dataBytes.byteLength);
              const chunk = new ChunkMetaData(id, 0, chunkSize);

              await this.device.writeCharacteristicWithoutResponseForService(
                this.serviceUUID,
                this.characteristicUUID,
                readMessageToBase64({
                  type: "Write",
                  meta: chunk,
                  data: dataBytes.slice(0, chunkSize),
                })
              );
            } else if (message.type === "WriteReceive") {
              const chunkSize = Math.min(
                mtu - 12,
                dataBytes.byteLength - message.nextStart
              );
              const chunk = new ChunkMetaData(id, message.nextStart, chunkSize);

              await this.device.writeCharacteristicWithoutResponseForService(
                this.serviceUUID,
                this.characteristicUUID,
                readMessageToBase64({
                  type: "Write",
                  meta: chunk,
                  data: dataBytes.slice(message.nextStart, chunkSize),
                })
              );
            } else if (message.type === "WriteFinish") {
              resolve(true);
            }
          }
        }
      );

      this.device
        .writeCharacteristicWithoutResponseForService(
          this.serviceUUID,
          this.characteristicUUID,
          readMessageToBase64({
            type: "StartWrite",
            meta,
          })
        )
        .catch(reject);
    });
  }

  onSubscribe(
    callback: (data: T) => void,
    errorCallback?: (error: any) => void
  ) {
    return this.device.monitorCharacteristicForService(
      this.serviceUUID,
      this.characteristicUUID,
      (error, characteristic) => {
        if (error) {
          errorCallback?.(error);
        }
        if (characteristic?.value) {
          const message = base64ToNotifyMessage(characteristic.value);
          if (message.type === "DataUpdate") {
            this.read().then(callback).catch(errorCallback);
          } else if (message.type === "Error") {
            errorCallback?.(message.message);
          }
        }
      }
    );
  }
}
