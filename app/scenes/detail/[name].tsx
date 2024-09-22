import { ColorPicker } from "@/components/colorPicker";
import { ColorsDuration } from "@/components/scenes/ColorsDuration";
import { useScenesStore, ScenesConfig } from "@/stores/useScenesStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Button,
  Colors,
  Incubator,
  SegmentedControl,
  TextField,
  Switch,
} from "react-native-ui-lib";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  fieldBorder: {
    borderColor: Colors.$outlinePrimary,
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    marginTop: 8,
  },
});

export default function SceneDetail() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const [scenes, updateScene] = useScenesStore((store) => [
    store.scenes,
    store.updateScene,
  ]);
  const [value, setValue] = useState<ScenesConfig>({
    name: "",
    description: "",
    type: "solid",
    color: Colors.$textPrimary,
    autoOn: false,
  });

  const currentScene = useMemo(() => {
    return scenes.find((scene) => scene.name === name);
  }, [name]);

  useEffect(() => {
    if (currentScene) {
      setValue(currentScene);
    }
  }, [currentScene]);

  const names = useMemo(() => {
    return scenes
      .map((scene) => scene.name)
      .filter((name) => name !== currentScene?.name);
  }, [scenes, currentScene]);

  const [error, setError] = useState<string>();
  const handleSubmit = () => {
    if (!value.name) {
      return setError("请输入名称");
    }
    if (names.includes(value.name)) {
      return setError("该名称已被使用");
    }
    updateScene(name as string, value);

    router.back();
  };

  return (
    <View useSafeArea padding-s4 flex gap-s4 bg-$backgroundDefault>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "更新场景",
          headerLeft: (props) => {
            return (
              <Button
                label="取消"
                link
                linkColor={Colors.$textGeneral}
                onPress={() => {
                  if (props.canGoBack) {
                    router.back();
                  }
                }}
              />
            );
          },
          headerRight: () => {
            return (
              <Button
                label="更新"
                link
                linkColor={Colors.$textGeneral}
                onPress={() => {
                  handleSubmit();
                }}
              />
            );
          },
        }}
      />
      <Incubator.Toast
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

      <SegmentedControl
        initialIndex={value.type === "solid" ? 0 : 1}
        onChangeIndex={(index) => {
          if (index === 0) {
            setValue({
              name: value.name,
              description: value.description,
              autoOn: value.autoOn,
              color: Colors.$textPrimary,
              type: "solid",
            });
          } else {
            setValue({
              name: value.name,
              type: "gradient",
              colors: [
                {
                  color: Colors.green80,
                  duration: 2,
                },
                {
                  color: Colors.orange70,
                  duration: 2,
                },
              ],
              autoOn: false,
              linear: true,
            });
          }
        }}
        segments={[{ label: "单色" }, { label: "渐变" }]}
        borderRadius={4}
      />
      <TextField
        retainValidationSpace={false}
        value={value.name}
        onChangeText={(name) => {
          setValue({ ...value, name });
        }}
        placeholderTextColor={Colors.$textDefault}
        placeholder="请输入名称"
        label="名称"
        labelColor={Colors.$textPrimary}
        fieldStyle={styles.fieldBorder}
        validateOnChange
        showClearButton
        validateOnBlur
        enableErrors
        validate={["required", (value) => !!value && !names.includes(value)]}
        validationMessage={["请输入名称", "该名称已被使用"]}
        maxLength={10}
        showCharCounter
      />
      <TextField
        value={value.description}
        onChangeText={(description) => {
          setValue({
            ...value,
            description,
          });
        }}
        multiline
        numberOfLines={4}
        placeholderTextColor={Colors.$textDefault}
        placeholder="请输入描述"
        label="描述"
        labelColor={Colors.$textPrimary}
        fieldStyle={styles.fieldBorder}
        showClearButton
      />
      <View row centerV spread gap-s4>
        <Text>自动开灯</Text>
        <Switch
          value={value.autoOn}
          onValueChange={(v) => setValue({ ...value, autoOn: v })}
          offColor={Colors.$textDisabled}
        />
      </View>
      {value.type === "gradient" && (
        <View row centerV spread gap-s4>
          <Text>线性渐变</Text>
          <Switch
            value={value.linear}
            onValueChange={(v) => setValue({ ...value, linear: v })}
            offColor={Colors.$textDisabled}
          />
        </View>
      )}
      {value.type === "solid" ? (
        <ColorPicker
          value={value.color}
          onChange={(color) => {
            setValue({ ...value, color });
          }}
        />
      ) : (
        <ColorsDuration
          value={value.colors}
          onChange={(colors) => setValue({ ...value, colors })}
        />
      )}
    </View>
  );
}
