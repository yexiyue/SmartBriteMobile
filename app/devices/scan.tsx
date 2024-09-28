import { useBle } from "@/hooks/useBleManager";
import { Stack, useRouter } from "expo-router";
import { Bluetooth, Inbox, RefreshCcw } from "lucide-react-native";
import { useEffect } from "react";
import { RefreshControl, ScrollView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Button,
  Text,
  View,
  TouchableOpacity,
  Colors,
} from "react-native-ui-lib";

export default function ScanDevice() {
  const { devices, startScan, ErrorToast, BleOpenDialog, isScanning } =
    useBle();
  const router = useRouter();
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isScanning) {
      rotate.value = withRepeat(
        withTiming(rotate.value + 1, {
          duration: 2500,
        })
      );
    }
  }, [isScanning]);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 360}deg` }],
  }));

  useEffect(() => {
    startScan(5);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "设备",
          headerShown: true,
          headerTitleStyle: { fontSize: 16 },
          headerRight: () => {
            return (
              <TouchableOpacity
                disabled={isScanning}
                onPress={() => startScan(5)}
              >
                <Animated.View style={animatedStyles}>
                  <RefreshCcw size={24} color={Colors.$textGeneral} />
                </Animated.View>
              </TouchableOpacity>
            );
          },
        }}
      />
      {ErrorToast}
      {BleOpenDialog}
      <View bg-$backgroundDefault flex useSafeArea>
        <ScrollView
          style={{
            flex: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isScanning}
              onRefresh={() => startScan(5)}
              colors={[Colors.$textGeneral]}
            />
          }
        >
          {devices.length === 0 ? (
            <View
              center
              style={{
                flex: 1,
                height: 500,
              }}
              gap-s1
            >
              <Inbox size={24} color={Colors.$textDisabled} />
              <Text>暂未扫描到设备，请下拉刷新</Text>
            </View>
          ) : (
            <View flex padding-s4 gap-s4 centerH>
              {devices.map((device) => {
                return (
                  <View
                    key={device.id}
                    style={{
                      width: "90%",
                      borderWidth: 1,
                      borderColor: Colors.$outlineDefault,
                    }}
                    br40
                    row
                    padding-s3
                    centerV
                    spread
                    gap-s2
                  >
                    <View row centerV gap-s2>
                      <View
                        style={{
                          height: 28,
                          width: 28,
                          borderWidth: 0.5,
                          borderColor: Colors.$textGeneral,
                          borderRadius: 20,
                        }}
                        center
                      >
                        <Bluetooth size={16} color={Colors.$textGeneral} />
                      </View>
                      <View centerV gap-s2>
                        <Text text70>名称 {device.name || "未知"}</Text>
                        <Text>ID {device.id}</Text>
                      </View>
                    </View>
                    <Button
                      disabled={!device.isConnectable}
                      label="连接"
                      onPress={() => {
                        router.push(`/devices/connect/${device.id}`);
                      }}
                      size="small"
                    />
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
