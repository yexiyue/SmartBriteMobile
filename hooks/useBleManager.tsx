import { useAsyncEffect, useMemoizedFn } from "ahooks";
import { ActivityAction, startActivityAsync } from "expo-intent-launcher";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import { Button, Colors, Incubator, Text, View } from "react-native-ui-lib";

const { Toast, Dialog } = Incubator;

export const manager = new BleManager();

async function requestPermissions() {
  if (Platform.OS === "ios") {
    return true;
  }

  if (Platform.OS === "android") {
    let checks = [
      PermissionsAndroid.check("android.permission.BLUETOOTH_CONNECT"),
      PermissionsAndroid.check("android.permission.BLUETOOTH_SCAN"),
      PermissionsAndroid.check("android.permission.ACCESS_FINE_LOCATION"),
    ];

    let allowed = await Promise.all(checks).then((res) => {
      return res.every((r) => r);
    });

    if (!allowed) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.ACCESS_FINE_LOCATION"] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }

    return allowed;
  }

  return false;
}

const connectDevice = async (deviceId: Device["id"]) => {
  const device = await manager.connectToDevice(deviceId);
  const connectedDevice = await device.connect();
  return await connectedDevice.discoverAllServicesAndCharacteristics();
};

export const useBle = () => {
  const [state, setState] = useState<State>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    manager.state().then((state) => {
      setState(state);
    });
    let unSubscribe = manager.onStateChange((state) => {
      setState(state);
    });
    return () => {
      unSubscribe.remove();
    };
  }, []);

  useAsyncEffect(async () => {
    const isAuthorized = await requestPermissions();
    setIsAuthorized(isAuthorized);
  }, []);

  const checkCloseState = useMemoizedFn(() => {
    if (state === State.PoweredOff) {
      setIsOpen(true);
      return false;
    }

    return true;
  });

  const startScan = useMemoizedFn(async (timeout?: number) => {
    try {
      if (checkCloseState()) {
        if (timeout) {
          setTimeout(() => {
            stopScan();
          }, timeout * 1000);
        }

        await manager.startDeviceScan(null, null, (error, scannedDevice) => {
          if (error) {
            setError(`${error}`);
            return;
          }
          if (
            scannedDevice &&
            !devices.some((d) => d.id === scannedDevice.id)
          ) {
            setDevices((devices) => [...devices, scannedDevice]);
          }
        });
      }
    } catch (error) {
      setError(`${error}`);
    }
  });

  const stopScan = useMemoizedFn(async () => {
    try {
      await manager.stopDeviceScan();
    } catch (error) {
      setError(`${error}`);
    }
  });

  const ErrorToast = (
    <Toast
      visible={!!error}
      position="top"
      autoDismiss={3000}
      onDismiss={() => {
        setError(undefined);
      }}
      message={error}
      preset="failure"
      swipeable
    />
  );

  const BleOpenDialog = (
    <Dialog
      visible={isOpen}
      onDismiss={() => setIsOpen(false)}
      center
      useSafeArea
      modalProps={{
        overlayBackgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <View
        padding-16
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        <Text text65BL center $backgroundWarningHeavy>
          提示
        </Text>
        <Text text70>当前未开启蓝牙，是否开启？</Text>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button
            size="medium"
            label="取消"
            backgroundColor={Colors.$backgroundDangerHeavy}
            onPress={() => {
              setIsOpen(false);
            }}
          />
          <Button
            size="medium"
            label="确定"
            onPress={async () => {
              try {
                if (Platform.OS === "ios") {
                  await startActivityAsync(ActivityAction.BLUETOOTH_SETTINGS);
                } else {
                  await manager.enable();
                }
              } catch (error) {
                console.log(error);
              } finally {
                setIsOpen(false);
              }
            }}
          />
        </View>
      </View>
    </Dialog>
  );

  return {
    state,
    devices,
    isAuthorized,
    error,
    ErrorToast,
    BleOpenDialog,
    startScan,
    stopScan,
    setError,
  };
};

export function uint8ArrayToBase64(arr: number[]) {
  return btoa(String.fromCharCode.apply(null, arr));
}
