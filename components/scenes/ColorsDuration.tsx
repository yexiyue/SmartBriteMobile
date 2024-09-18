import { ColorDuration } from "@/types";
import { useControllableValue } from "ahooks";
import chroma from "chroma-js";
import { Trash } from "lucide-react-native";
import React from "react";
import {
  Button,
  Colors,
  TextField,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { ColorPicker } from "../colorPicker";
import { ScrollView } from "react-native";

export const ColorsDuration = (props: {
  value?: ColorDuration[];
  onChange?: (value: ColorDuration[]) => void;
}) => {
  const [value, setValue] = useControllableValue<ColorDuration[]>(props, {
    defaultValue: [],
  });

  return (
    <View gap-s2 flex>
      <ScrollView style={{ flex: 1 }}>
        {value?.map((item, index) => (
          <View row gap-s2 centerV spread key={index}>
            <ColorPicker
              value={item.color}
              onChange={(v) => {
                setValue(
                  value.map((item, i) => {
                    if (index === i) {
                      return {
                        duration: item.duration,
                        color: v,
                      };
                    }
                    return item;
                  })
                );
              }}
            />
            <TextField
              value={String(item.duration)}
              onChangeText={(v) => {
                setValue(
                  value.map((item, i) => {
                    if (index === i) {
                      return {
                        color: item.color,
                        duration: Number.isNaN(Number(v)) ? 0 : Number(v),
                      };
                    }
                    return item;
                  })
                );
              }}
              containerProps={{
                flex: true,
              }}
              fieldStyle={{
                borderColor: Colors.$outlinePrimary,
                borderWidth: 1,
                borderRadius: 4,
                padding: 4,
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity
              disabled={value.length <= 2}
              onPress={() => {
                setValue(
                  value.filter((_, i) => {
                    return index !== i;
                  })
                );
              }}
              style={{
                padding: 8,
                backgroundColor:
                  value.length <= 2
                    ? Colors.$backgroundDangerLight
                    : Colors.$backgroundDangerHeavy,
              }}
              br20
            >
              <Trash size={20} color={Colors.$white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Button
        onPress={() => {
          setValue([
            ...value,
            {
              color: chroma.random().hex("rgb"),
              duration: 2,
            },
          ]);
        }}
        label="添加渐变颜色"
        disabled={value.length >= 5}
      />
    </View>
  );
};
