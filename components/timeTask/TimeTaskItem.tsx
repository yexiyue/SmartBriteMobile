import { TimeTask } from "@/stores/useTimeTaskStore";
import dayjs from "dayjs";
import { Lightbulb, LightbulbOff } from "lucide-react-native";
import { Colors, View, Text, TouchableOpacity } from "react-native-ui-lib";
const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
export const TimeTaskItem = ({
  timeTask,
  onPress,
}: {
  timeTask: TimeTask;
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
          {timeTask.operation === "open" ? (
            <Lightbulb size={16} color={Colors.$textGeneral} />
          ) : (
            <LightbulbOff size={16} color={Colors.$textGeneral} />
          )}
        </View>
        <View spread paddingB-s1>
          <Text text70BL>{timeTask.name}</Text>
          <View row gap-s2>
            <Text text80BL>
              {timeTask.kind === "day"
                ? "每天"
                : timeTask.kind === "week"
                ? `每周${weekdays[timeTask.dayOfWeek - 1]}`
                : "一次"}
            </Text>
            {timeTask.kind === "day" && (
              <Text text80>时间：{dayjs(timeTask.delay).format("HH:mm")}</Text>
            )}
            {timeTask.kind === "week" && (
              <Text text80>时间：{dayjs(timeTask.delay).format("HH:mm")}</Text>
            )}
            {timeTask.kind === "once" && (
              <Text text80>
                时间：{dayjs(timeTask.endTime).format("YYYY-MM-DD HH:mm")}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
