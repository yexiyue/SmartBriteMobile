import { useRouter } from "expo-router";
import { Button, Text } from "react-native-ui-lib";
export default function HomeScreen() {
  const router = useRouter();

  return (
    <>
      <Text>Home</Text>
      <Button
        onPress={() => {
          router.push("/devices/scan");
        }}
      >
        <Text>扫描设备</Text>
      </Button>
    </>
  );
}
