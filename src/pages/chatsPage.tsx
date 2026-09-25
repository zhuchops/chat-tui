import { Box, Text, useInput } from "ink";
import type { AuthScreen } from "../routers/authenticatedRouter";
import { ScrollView, type ScrollViewRef } from "ink-scroll-view";
import { useRef } from "react";

type ChatsPageProps = {
  setScreen: React.Dispatch<React.SetStateAction<AuthScreen>>
}

export default function ChatsPage({ setScreen }: ChatsPageProps) {
  const scrollViewRef = useRef<ScrollViewRef>(null)

  useInput((input, key) => {
    if (key.upArrow) scrollViewRef.current?.scrollBy(-1)
    if (key.downArrow) scrollViewRef.current?.scrollBy(1)
    if (key.escape) setScreen('dashboard')
  })

  return (
    <Box flexDirection="column">
      {/*Title*/}
      <Text bold>CHATS</Text>
      {/*scrollable chats*/}
      <ScrollView ref={scrollViewRef}>
        {/*chats*/}
      </ScrollView>
      {/*footer*/}
      <Box flexDirection="column">
        <Box>
          <Text>&lt;tab\shift + tab&gt; Move focus</Text>
        </Box>
        <Box>
          <Text>&lt;enter&gt; Confirm</Text>
        </Box>
        <Box>
          <Text>&lt;Escape&gt; Go back</Text>
        </Box>
        <Box>
          <Text>&lt;Ctrl + C&gt; Exit</Text>
        </Box>
      </Box>
    </Box>
  )
}
