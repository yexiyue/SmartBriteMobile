import { Tabs } from "expo-router";
import { Lightbulb, Settings } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Lightbulb color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
