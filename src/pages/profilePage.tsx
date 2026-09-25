import { Box, Text, useInput } from "ink"
import { useAuth } from "../contexts/authContext"
import type { AuthenticatedScreen } from "../routers/authenticatedRouter"

type ProfilePageProps = {
  setScreen: React.Dispatch<React.SetStateAction<AuthenticatedScreen>>
}

export default function ProfilePage({ setScreen }: ProfilePageProps) {
  const auth = useAuth()

  // keyboard (also keeps stdin open, otherwise the process exits after first render)
  useInput(async (input) => {
    if (input === 'l') {
      await auth.logout()
    }
  })

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        <Text>Email: {auth.user?.email}</Text>
        <Text>Username: {auth.user?.username}</Text>
      </Box>

      <Box flexDirection="column">
        <Box>
          <Text>&lt;l&gt; Logout</Text>
        </Box>
        <Box>
          <Text>&lt;Ctrl + C&gt; Exit</Text>
        </Box>
      </Box>
    </Box>
  )
}
