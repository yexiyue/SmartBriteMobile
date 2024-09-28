import { useLed } from "@/hooks/useLed";
import { useLocalSearchParams } from "expo-router";
import { Button, Text } from "react-native-ui-lib";

export default function ConnectScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const { ledState, scene, timeTasks } = useLed(deviceId);
  console.log(ledState, scene, timeTasks);
  // console.log(device);
  return (
    <>
      <Text>Connect</Text>
      <Button label="Go to Home" onPress={() => {}} />
    </>
  );
}
