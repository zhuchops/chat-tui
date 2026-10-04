import { Box, Text, useInput } from "ink";
import { useState } from "react";
import type { AuthScreen } from "../routers/authenticatedRouter.tsx";

type DashboardPageProps = {
  setScreen: React.Dispatch<React.SetStateAction<AuthScreen>>;
};

export default function DashboardPage({ setScreen }: DashboardPageProps) {
  const [focused, setFocused] = useState(0);

  useInput((_input, key) => {
    if (key.tab && key.shift) {
      setFocused((prev) => (prev + 3 - 1) % 3);
    } else if (key.tab) {
      setFocused((prev) => (prev + 1) % 3);
    }
    if (key.return) {
      switch (focused) {
        case 0:
          setScreen({ screen: "profile" });
          break;
        case 1:
          setScreen({ screen: "chats" });
          break;
        case 2:
          setScreen({ screen: "settings" });
          break;
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>DASHBOARD</Text>
      <Text>
        {focused === 0 ? <Text bold>Profile</Text> : "Profile"}
      </Text>
      <Text>
        {focused === 1 ? <Text bold>Chats</Text> : "Chats"}
      </Text>
      <Text>
        {focused === 2 ? <Text bold>Settings</Text> : "Settings"}
      </Text>

      {/*footer*/}
      <Box flexDirection="column">
        <Box>
          <Text>&lt;tab\shift + tab&gt; Move focus</Text>
        </Box>
        <Box>
          <Text>&lt;enter&gt; Choose chat</Text>
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
