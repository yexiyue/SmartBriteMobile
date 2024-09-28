import { Device } from "react-native-ble-plx";
import { manager } from "./useBleManager";
import { useEffect, useState } from "react";
import { useAsyncEffect } from "ahooks";
import { Led } from "@/utils/led";
import { Scene } from "@/types";
import { TimeTask } from "@/stores/useTimeTaskStore";

const connectDevice = async (deviceId: Device["id"]) => {
  const device = await manager.connectToDevice(deviceId, {
    requestMTU: 256,
  });
  const connectedDevice = await device.connect();
  return await connectedDevice.discoverAllServicesAndCharacteristics();
};

export const useLed = (
  deviceId: Device["id"],
  options: { manual?: boolean } = { manual: false }
) => {
  const { manual } = options;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [device, setDevice] = useState<Device>();
  const [led, setLed] = useState<Led>();
  const [ledState, setLedState] = useState<"opened" | "closed">();
  const [scene, setScene] = useState<Scene>();
  const [timeTasks, setTimeTasks] = useState<TimeTask[]>([]);

  useAsyncEffect(async () => {
    if (device) {
      try {
        const led = new Led(device);
        setLed(led);
        setScene(await led.sceneTransmission.read());
        setTimeTasks(await led.timeTaskTransmission.read());
        setLedState(await led.getState());
      } catch (error) {
        setError(`${error}`);
      }
    }
  }, [device]);

  useEffect(() => {
    const stateSubscribe = led?.onState(setLedState);
    const scentSubscribe = led?.sceneTransmission.onSubscribe(
      setScene,
      (err) => {
        setError(`${err}`);
      }
    );
    const timeTaskSubscribe = led?.timeTaskTransmission.onSubscribe(
      setTimeTasks,
      (err) => {
        setError(`${err}`);
      }
    );

    return () => {
      stateSubscribe?.remove();
      scentSubscribe?.remove();
      timeTaskSubscribe?.remove();
    };
  }, [led]);

  const connect = async () => {
    try {
      setIsConnecting(true);
      const device = await connectDevice(deviceId);
      setConnected(await device.isConnected());
      setDevice(device);
    } catch (error) {
      setError(`连接设备${deviceId}失败 ${error}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await device?.cancelConnection();
    } catch (error) {
      setError(`取消连接设备${deviceId}失败 ${error}`);
    }
  };

  useAsyncEffect(async () => {
    if (!manual) {
      await connect();
    }
  }, []);

  return {
    ledState,
    scene,
    timeTasks,
    error,
    connected,
    isConnecting,
    device,
    connect,
    disconnect,
  };
};
