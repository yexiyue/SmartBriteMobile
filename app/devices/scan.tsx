import { useBle } from "@/hooks/useBleManager";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Button, Text } from "react-native-ui-lib";

export default function ScanDevice() {
  const { state, devices, startScan, ErrorToast, BleOpenDialog } = useBle();
  // useEffect(() => {
  //   startScan(5);
  // }, []);
  console.log(state, devices);
  return (
    <>
      <Stack.Screen options={{ title: "Scan Device", headerShown: true }} />
      <Text>ScanDevice</Text>
      <Button label="Start Scan" onPress={() => startScan(5)} />
      {ErrorToast}
      {BleOpenDialog}
    </>
  );
}
