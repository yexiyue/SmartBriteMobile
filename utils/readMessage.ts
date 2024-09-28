import {
  base64ToUint8Array,
  fastTextDecode,
  uint8ArrayToBase64,
} from "./parse";
import { MetaData, ChunkMetaData } from "./metaData";

export type ReadMessage =
  | {
      type: "StartRead";
    }
  | {
      type: "ReadReceive";
      nextStart: number;
    }
  | {
      type: "ReadFinish";
    }
  | {
      type: "StartWrite";
      meta: MetaData;
    }
  | {
      type: "Write";
      meta: ChunkMetaData;
      data: Uint8Array;
    };

export function readMessageToBase64(message: ReadMessage) {
  let uint8Array = new Uint8Array(1);
  const dataView = new DataView(uint8Array.buffer);

  switch (message.type) {
    case "StartRead":
      dataView.setUint8(0, 0);
      break;
    case "ReadReceive":
      uint8Array = new Uint8Array(5);
      const newDataView = new DataView(uint8Array.buffer);
      newDataView.setUint8(0, 1);
      newDataView.setUint32(1, message.nextStart, true);
      break;
    case "ReadFinish":
      dataView.setUint8(0, 2);
      break;
    case "StartWrite":
      dataView.setUint8(0, 3);
      uint8Array = new Uint8Array([...uint8Array, ...message.meta.bytes()]);
      break;
    case "Write":
      dataView.setUint8(0, 4);

      uint8Array = new Uint8Array([
        ...uint8Array,
        ...message.meta.bytes(),
        ...message.data,
      ]);
      break;
  }
  return uint8ArrayToBase64(uint8Array);
}

export type NotifyMessage =
  | {
      type: "DataUpdate";
    }
  | {
      type: "ReadReady";
      meta: MetaData;
    }
  | {
      type: "WriteReady";
      mtu: number;
    }
  | {
      type: "WriteReceive";
      nextStart: number;
    }
  | {
      type: "WriteFinish";
    }
  | {
      type: "Error";
      message: string;
    };

export function base64ToNotifyMessage(base64: string): NotifyMessage {
  const uint8Array = base64ToUint8Array(base64);
  const dataView = new DataView(uint8Array.buffer);

  switch (dataView.getUint8(0)) {
    case 0:
      return { type: "WriteFinish" };
    case 1:
      return { type: "DataUpdate" };
    case 2:
      return {
        type: "ReadReady",
        meta: MetaData.fromData(uint8Array.slice(1))[0],
      };
    case 3:
      return {
        type: "WriteReady",
        mtu: dataView.getUint16(1, true),
      };
    case 4:
      return {
        type: "WriteReceive",
        nextStart: dataView.getUint32(1, true),
      };
    case 5:
      return {
        type: "Error",
        message: fastTextDecode(uint8Array.slice(1)),
      };
    default:
      throw new Error("Invalid message");
  }
}
