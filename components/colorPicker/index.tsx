import { useControllableValue } from "ahooks";
import { ColorPickerModal } from "./ColrPickerModal";
import { Colors, View, Text, TouchableOpacity } from "react-native-ui-lib";

type ColorPickerProps = {
  value?: string;
  onChange?: (color: string) => void;
};

export const ColorPicker = (props: ColorPickerProps) => {
  const [color, setColor] = useControllableValue<string>(props, {
    defaultValue: Colors.$textPrimary,
  });

  return (
    <ColorPickerModal defaultValue={color} onOk={setColor}>
      {(onOpen) => (
        <TouchableOpacity
          row
          centerV
          style={{
            borderWidth: 1,
            borderColor: Colors.$outlineNeutral,
            width: 106,
            gap: 4,
          }}
          br20
          padding-s1
          onPress={onOpen}
        >
          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: color,
              borderWidth: 1,
              borderColor: Colors.$outlineNeutralHeavy,
              flexShrink: 0,
            }}
            br20
          />
          <Text>{color}</Text>
        </TouchableOpacity>
      )}
    </ColorPickerModal>
  );
};
