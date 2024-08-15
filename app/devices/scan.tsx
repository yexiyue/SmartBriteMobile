import { Stack } from "expo-router";
import { Text } from "react-native-ui-lib";

export default function ScanDevice() {
  return (
    <>
      <Stack.Screen options={{ title: "Scan Device", headerShown: true }} />
      <Text>ScanDevice</Text>
    </>
  );
}
