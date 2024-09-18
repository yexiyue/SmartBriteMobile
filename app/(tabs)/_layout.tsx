import { Stack, Tabs } from "expo-router";
import { AlarmClock, Microscope, Smartphone } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "react-native-ui-lib";

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.$backgroundDefault }}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: "设备",
            headerShown: false,
            tabBarIcon: ({ color }) => <Smartphone color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="scene"
          options={{
            title: "场景",
            headerShown: false,
            tabBarIcon: ({ color }) => <Microscope color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="timeTask"
          options={{
            title: "定时",
            headerShown: false,
            tabBarIcon: ({ color }) => <AlarmClock color={color} size={24} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
