import { TimeTask, useTimeTaskStore } from "@/stores/useTimeTaskStore";
import { Stack, useRouter } from "expo-router";
import { ChevronDown, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Button,
  Colors,
  DateTimePicker,
  Incubator,
  Picker,
  SegmentedControl,
  TextField,
  View,
} from "react-native-ui-lib";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const styles = StyleSheet.create({
  fieldBorder: {
    borderColor: Colors.$outlinePrimary,
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    marginTop: 8,
  },
});

export default function AddScene() {
  const router = useRouter();
  const [timeTasks, addTimeTask] = useTimeTaskStore((store) => [
    store.timeTasks,
    store.addTimeTask,
  ]);

  const names = useMemo(() => {
    return timeTasks.map((scene) => scene.name);
  }, [timeTasks]);

  const [value, setValue] = useState<TimeTask>({
    kind: "day",
    name: "",
    operation: "open",
    delay: dayjs().add(5, "minute").utc().format(),
  });

  const [error, setError] = useState<string>();
  const handleSubmit = () => {
    if (!value.name) {
      return setError("请输入名称");
    }
    if (names.includes(value.name)) {
      return setError("该名称已被使用");
    }
    addTimeTask(value);
    router.back();
  };

  return (
    <View useSafeArea padding-s4 gap-s4 flex bg-$backgroundDefault>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "添加定时任务",
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
                label="添加"
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
        initialIndex={1}
        onChangeIndex={(index) => {
          if (index === 0) {
            setValue({
              kind: "once",
              name: value.name,
              operation: value.operation,
              endTime: dayjs().add(5, "minute").utc().format(),
            });
          } else if (index === 1) {
            setValue({
              kind: "day",
              name: value.name,
              operation: value.operation,
              delay: dayjs().add(5, "minute").utc().format(),
            });
          } else {
            setValue({
              kind: "week",
              name: value.name,
              operation: value.operation,
              delay: dayjs().add(5, "minute").utc().format(),
              dayOfWeek: 1,
            });
          }
        }}
        segments={[{ label: "一次" }, { label: "每天" }, { label: "每周" }]}
        borderRadius={4}
      />
      <TextField
        retainValidationSpace={false}
        value={value.name}
        onChangeText={(name) => {
          setValue({ ...value, name });
        }}
        placeholder="请输入名称"
        fieldStyle={styles.fieldBorder}
        label="名称"
        validateOnChange
        showClearButton
        validateOnBlur
        enableErrors
        validate={["required", (value: string) => !names.includes(value)]}
        validationMessage={["请输入名称", "该名称已被使用"]}
        maxLength={10}
        showCharCounter
      />
      {value.kind === "once" && (
        <DateTimePicker
          placeholder="请选择日期"
          label="日期"
          fieldStyle={styles.fieldBorder}
          value={dayjs(value.endTime).toDate()}
          onChange={(v) => {
            setValue({ ...value, endTime: dayjs(v).utc().format() });
          }}
          minimumDate={new Date()}
        />
      )}
      {value.kind === "week" && (
        <Picker
          placeholder="请选择星期"
          label="星期"
          value={value.dayOfWeek}
          onChange={(v) => {
            setValue({ ...value, dayOfWeek: v as number });
          }}
          fieldStyle={styles.fieldBorder}
          mode={Picker.modes.SINGLE}
          trailingAccessory={
            <ChevronDown size={20} color={Colors.$iconPrimary} />
          }
          topBarProps={{
            cancelButtonProps: {
              iconSource() {
                return <X size={20} color={Colors.$textGeneral} />;
              },
            },
          }}
          items={[
            {
              label: "星期一",
              value: 1,
            },
            {
              label: "星期二",
              value: 2,
            },
            {
              label: "星期三",
              value: 3,
            },
            {
              label: "星期四",
              value: 4,
            },
            {
              label: "星期五",
              value: 5,
            },
            {
              label: "星期六",
              value: 6,
            },
            {
              label: "星期日",
              value: 7,
            },
          ]}
        />
      )}
      <DateTimePicker
        placeholder="请选择时间"
        label="时间"
        mode="time"
        is24Hour
        value={
          value.kind === "once"
            ? dayjs(value.endTime).set("seconds", 0).toDate()
            : dayjs(value.delay).set("seconds", 0).toDate()
        }
        onChange={(v) => {
          if (value.kind === "once") {
            setValue({ ...value, endTime: dayjs(v).utc().format() });
          } else {
            setValue({ ...value, delay: dayjs(v).utc().format() });
          }
        }}
        fieldStyle={styles.fieldBorder}
      />
      <Picker
        placeholder="请选择操作"
        label="操作"
        value={value.operation}
        onChange={(v) => {
          setValue({ ...value, operation: v as any });
        }}
        fieldStyle={styles.fieldBorder}
        mode={Picker.modes.SINGLE}
        trailingAccessory={
          <ChevronDown size={20} color={Colors.$iconPrimary} />
        }
        topBarProps={{
          cancelButtonProps: {
            iconSource() {
              return <X size={20} color={Colors.$textGeneral} />;
            },
          },
        }}
        items={[
          {
            label: "开灯",
            value: "open",
          },
          {
            label: "关灯",
            value: "close",
          },
        ]}
      />
    </View>
  );
}
