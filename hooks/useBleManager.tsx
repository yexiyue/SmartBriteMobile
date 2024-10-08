import { useAsyncEffect, useMemoizedFn } from "ahooks";
import { ActivityAction, startActivityAsync } from "expo-intent-launcher";
import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import {
  BorderRadiuses,
  Button,
  Colors,
  Incubator,
  Text,
  View,
} from "react-native-ui-lib";

const { Toast, Dialog } = Incubator;

export let manager = new BleManager();

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

export const useBle = () => {
  const [state, setState] = useState<State>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const resolveRef = useRef<(data: boolean) => void>();

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
    return new Promise<boolean>((resolve) => {
      if (state === State.PoweredOff) {
        setIsOpen(true);
        resolveRef.current = resolve;
      } else {
        resolve(true);
      }
    });
  });

  const startScan = useMemoizedFn(async (timeout?: number) => {
    try {
      if (await checkCloseState()) {
        if (timeout) {
          setTimeout(() => {
            stopScan();
            setIsScanning(false);
          }, timeout * 1000);
        }

        setIsScanning(true);
        await manager.startDeviceScan(
          ["e572775c-0df9-4b44-926b-b692e31d6971"],
          null,
          (error, scannedDevice) => {
            if (error) {
              setError(`${error}`);
              return;
            }
            if (
              scannedDevice &&
              !devices.some((d) => d.id === scannedDevice.id)
            ) {
              if (!devices.find((d) => d.id === scannedDevice.id)) {
                devices.push(scannedDevice);
                setDevices((devices) => [...devices]);
              }
            }
          }
        );
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
      containerStyle={{
        borderRadius: BorderRadiuses.br50,
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
            size="small"
            label="取消"
            backgroundColor={Colors.$textGeneral}
            onPress={() => {
              setIsOpen(false);
              resolveRef.current?.(false);
            }}
          />
          <Button
            size="small"
            label="确定"
            onPress={async () => {
              try {
                if (Platform.OS === "ios") {
                  await startActivityAsync(ActivityAction.BLUETOOTH_SETTINGS);
                } else {
                  await manager.enable();
                }
                resolveRef.current?.(true);
              } catch (error) {
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
    isScanning,
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

