import { SceneItem } from "@/components/scenes/SceneItem";
import { useScenesStore } from "@/stores/useScenesStore";
import { useRouter } from "expo-router";
import { Inbox, PlusIcon, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList } from "react-native";
import {
  Button,
  Colors,
  Drawer,
  Text,
  TextField,
  View,
} from "react-native-ui-lib";

export default function SceneScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scenes, removeScene] = useScenesStore((store) => [
    store.scenes,
    store.removeScene,
  ]);

  const filteredScenes = useMemo(() => {
    if (search) {
      return scenes.filter((scene) => {
        return scene.name.includes(search);
      });
    } else {
      return scenes;
    }
  }, [scenes, search]);

  return (
    <View flex useSafeArea bg-$backgroundDefault>
      <View spread row centerV padding-s2 gap-s4>
        <TextField
          value={search}
          onChangeText={(text) => {
            setSearch(text);
          }}
          placeholder="搜索场景"
          leadingAccessory={<Search size={16} color={Colors.$textPrimary} />}
          containerStyle={{
            borderWidth: 0.5,
            flex: 1,
            paddingHorizontal: 8,
            borderRadius: 16,
            borderColor: Colors.$outlinePrimary,
            paddingVertical: 1,
          }}
          style={{
            paddingLeft: 8,
          }}
        />
        <Button
          label="添加"
          size="small"
          iconSource={() => (
            <PlusIcon size={16} color={Colors.$textDefaultLight} />
          )}
          onPress={() => router.push("/scenes/add")}
        />
      </View>
      <FlatList
        ListEmptyComponent={
          <View center height={500}>
            <View center gap-s1>
              <Inbox size={24} color={Colors.$textDefault} />
              <Text>
                {search && scenes.length > 0 ? "未搜索到场景" : "暂无场景"}
              </Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              borderWidth: 0.5,
              borderColor: Colors.$outlineDisabled,
            }}
          />
        )}
        data={filteredScenes}
        renderItem={({ item }) => (
          <Drawer
            key={item.name}
            rightItems={[
              {
                text: "删除",
                background: Colors.$backgroundDangerHeavy,
                onPress: () => {
                  removeScene(item.name);
                },
              },
            ]}
          >
            <SceneItem
              scene={item}
              onPress={() => router.push(`/scenes/detail/${item.name}`)}
            />
          </Drawer>
        )}
        contentContainerStyle={{
          borderBottomWidth: 0.5,
          borderColor: Colors.$outlineDisabled,
        }}
      />
    </View>
  );
}
