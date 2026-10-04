import { Box, Text, useInput } from "ink";
import { ScrollView, type ScrollViewRef } from "ink-scroll-view";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api.ts";
import { useNotifications } from "../contexts/notificaitonsContext.tsx";
import type { AuthScreen } from "../routers/authenticatedRouter.tsx";

type ChatsPageProps = {
  setScreen: React.Dispatch<React.SetStateAction<AuthScreen>>;
};

type Chat = {
  id: number;
  type: "direct" | "group";
  title: string;
};

export default function FriendsPage({ setScreen }: ChatsPageProps) {
  const scrollViewRef = useRef<ScrollViewRef>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setChats] = useState<Chat[]>([]);
  const notifications = useNotifications();

  useInput((_input, key) => {
    if (key.upArrow) scrollViewRef.current?.scrollBy(-1);
    if (key.downArrow) scrollViewRef.current?.scrollBy(1);
    if (key.escape) setScreen({ screen: "dashboard" });
  });

  const fetchChats = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.chat.$get();
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setChats(data);
    } catch (e) {
      notifications.push({
        type: "error",
        content: e instanceof Error ? e.message : "Cannot load chats",
      });
    } finally {
      setLoading(false);
    }
  }, [notifications]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  if (loading) {
    return (
      <Box>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/*Title*/}
      <Text bold>FRIENDS</Text>

      {/*scrollable chats*/}
      <ScrollView ref={scrollViewRef}>
        {friends.map((chat) => {
          return (
            <Box>
              <Text>{chat.title}</Text>
            </Box>
          );
        })}
      </ScrollView>

      {/*footer*/}
      <Box flexDirection="column">
        <Box>
          <Text>&lt;tab\shift + tab&gt; Move focus</Text>
        </Box>
        <Box>
          <Text>&lt;n&gt; New friend</Text>
        </Box>
        <Box>
          <Text>&lt;enter&gt; Confirm</Text>
        </Box>
        <Box>
          <Text>&lt;r&gt; Reload</Text>
        </Box>
        <Box>
          <Text>&lt;Escape&gt; Go back</Text>
        </Box>
        <Box>
          <Text>&lt;Ctrl + C&gt; Exit</Text>
        </Box>
      </Box>
    </Box>
  );
}
