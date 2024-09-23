import { useBle } from "@/hooks/useBleManager";
import { Stack } from "expo-router";
import { Bluetooth, Inbox } from "lucide-react-native";
import { useEffect } from "react";
import { RefreshControl, ScrollView } from "react-native";
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

  useEffect(() => {
    startScan(5);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: "扫描设备",
          headerShown: true,
          headerTitleStyle: { fontSize: 16 },
          headerRight: () => {
            return (
              <Button
                disabled={isScanning}
                label="刷新"
                link
                linkColor={Colors.$textGeneral}
                onPress={() => {
                  startScan(5);
                }}
              />
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
                        device.isConnectable;
                        console.log("连接", device);
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
