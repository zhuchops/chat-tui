import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useContext, useState } from "react";
import { useAuth } from "../contexts/authContext.tsx";
import { NotificationsContext } from "../contexts/notificaitonsContext.tsx";
import type { UnauthScreen } from "../routers/unauthenticatedRouter.tsx";
import { api } from "../api.ts";

type RegisterPageProps = {
  setScreen: React.Dispatch<React.SetStateAction<UnauthScreen>>;
};

export default function RegisterPage({ setScreen }: RegisterPageProps) {
  const auth = useAuth();
  const notificationCtx = useContext(NotificationsContext);
  const [focused, setFocused] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // send login to server
  async function register() {
    const res = await api.auth.register.$post({
      json: {
        username: username,
        email: email,
        password: password,
      },
    });
    if (!res.ok) {
      if (res.status == 409) {
        notificationCtx?.push({
          type: "error",
          content: "Username or email already exists",
        });
        return;
      }
      if (res.status == 400) {
        notificationCtx?.push({ type: "error", content: "Bad request" });
        return;
      }
      notificationCtx?.push({
        type: "error",
        content: "Unexpected error. Try again",
      });
      return;
    }
    const data = await res.json();
    auth.login(
      {
        id: data?.user.id!,
        username: data?.user.username!,
        email: data?.user.email!,
      },
      data?.accessToken!,
      data?.refreshToken!,
    );
    notificationCtx?.push({ type: "message", content: "Logged in successful" });
  }

  // keyboard
  useInput(async (_input, key) => {
    if (key.tab && key.shift) {
      setFocused((prev) => (prev + 4 - 1) % 4);
    } else if (key.tab) {
      setFocused((prev) => (prev + 1) % 4);
    }
    if (key.return) {
      if (focused == 3) {
        setScreen("login");
      } else {
        await register();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>REGISTER</Text>
      </Box>

      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text>{focused === 0 ? "> " : ""}</Text>
          <TextInput
            focus={focused === 0}
            value={email}
            onChange={setEmail}
            placeholder="email"
          />
        </Box>

        <Box flexDirection="row">
          <Text>{focused === 1 ? "> " : ""}</Text>
          <TextInput
            focus={focused === 1}
            value={username}
            onChange={setUsername}
            placeholder="username"
          />
        </Box>

        <Box flexDirection="row">
          <Text>{focused === 2 ? "> " : ""}</Text>
          <TextInput
            focus={focused === 2}
            value={password}
            onChange={setPassword}
            placeholder="password"
            mask="*"
          />
        </Box>

        <Box>
          <Text>
            {focused === 3 ? <Text bold>Login HERE</Text> : "Login HERE"}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column">
        <Box>
          <Text>&lt;tab\shift + tab&gt; Move focus</Text>
        </Box>
        <Box>
          <Text>&lt;enter&gt; Confirm</Text>
        </Box>
        <Box>
          <Text>&lt;Ctrl + C&gt; Exit</Text>
        </Box>
      </Box>
    </Box>
  );
}
