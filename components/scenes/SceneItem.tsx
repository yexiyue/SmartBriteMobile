import { ScenesConfig } from "@/stores/useScenesStore";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, View, Text, TouchableOpacity } from "react-native-ui-lib";

export const SceneItem = ({
  scene,
  onPress,
}: {
  scene: ScenesConfig;
  onPress: () => void;
}) => {
  return (
    <View bg-$backgroundDefault paddingL-s4>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
        onPress={onPress}
      >
        {scene.type === "solid" ? (
          <View
            style={{
              height: 28,
              width: 28,
              borderWidth: 0.5,
              borderColor: Colors.$outlineNeutralHeavy,
              borderRadius: 20,
              backgroundColor: scene.color,
            }}
          ></View>
        ) : (
          <LinearGradient
            colors={scene.colors.map((color) => color.color)}
            style={{
              height: 28,
              width: 28,
              borderWidth: 0.5,
              borderColor: Colors.$outlineNeutralHeavy,
              borderRadius: 20,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        )}
        <View spread paddingB-s1>
          <Text text70BL>{scene.name}</Text>
          <View row gap-s2>
            <Text text80BL>{scene.type === "solid" ? "单色" : "渐变"}</Text>
            <Text text80>{scene.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
