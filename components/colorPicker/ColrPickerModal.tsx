import { useControllableValue } from "ahooks";
import { PropsWithChildren, ReactNode, useState } from "react";
import { Colors, Modal, TouchableOpacity, View } from "react-native-ui-lib";
import ColorPicker, {
  BrightnessSlider,
  HueSlider,
  Panel1,
  PreviewText,
  Swatches,
} from "reanimated-color-picker";
import Animated, { useSharedValue, withTiming } from "react-native-reanimated";
import { Check, X } from "lucide-react-native";
import chroma from "chroma-js";

type ColorPickerModalProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  onOk?: (color: string) => void;
};

export function ColorPickerModal(
  props: ColorPickerModalProps & {
    children: (onOpen: () => void) => ReactNode;
  }
) {
  const [color, setColor] = useControllableValue<string>(props);
  const [open, setOpen] = useState(false);
  const backgroundColor = useSharedValue("transparent");

  const onClose = () => {
    backgroundColor.value = "transparent";
    setOpen(false);
  };

  return (
    <>
      {props.children(() => {
        setOpen(true);
        backgroundColor.value = withTiming("rgba(0,0,0,0.5)", {
          duration: 500,
        });
      })}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        useGestureHandlerRootView
      >
        <Animated.View
          style={[{ flex: 1, position: "relative", backgroundColor }]}
        >
          <View
            bg-$backgroundDefault
            padding-s4
            absB
            style={{
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            <View row spread>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color={Colors.$textGeneral} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  props.onOk?.(color);
                  onClose();
                }}
              >
                <Check size={20} color={Colors.$textGeneral} />
              </TouchableOpacity>
            </View>
            <ColorPicker
              value={color}
              onComplete={(color) => {
                setColor(chroma(color.rgb).hex("rgb"));
              }}
            >
              <View gap-s4>
                <PreviewText colorFormat="hex" />
                <Panel1 />
                <HueSlider />
                <BrightnessSlider />
                <Swatches />
              </View>
            </ColorPicker>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}
