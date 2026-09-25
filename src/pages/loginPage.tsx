import { useContext, useState } from 'react'
import { NotificationsContext } from "../contexts/notificaitonsContext"
import { useAuth } from "../contexts/authContext"
import type { UnauthScreen } from "../routers/unauthenticatedRouter"
import { Box, Text, useInput } from "ink"
import TextInput from "ink-text-input"
import { api } from '../api'

type LoginPageProps = {
  setScreen: React.Dispatch<React.SetStateAction<UnauthScreen>>
}

export default function LoginPage({ setScreen }: LoginPageProps) {
  const auth = useAuth()
  const notificationCtx = useContext(NotificationsContext)
  const [focused, setFocused] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function login() {
    const res = await api.auth.login.post({ email: email, password: password })
    if (res.error) {
      if (res.error.status == 401) {
        notificationCtx?.push({ type: 'error', content: 'Bad credentials' })
        return
      }
      if (res.error.status == 422) {
        if (res.error.value.title === 'Validation Error') {
          notificationCtx?.push({ type: 'error', content: 'Bad request' })
          return
        }
      }
      notificationCtx?.push({ type: 'error', content: 'Unexpected error. Try again' })
      return
    }
    const data = res.data
    auth.login({ id: data?.user.id!, username: data?.user.username!, email: data?.user.email!, }, data?.accessToken!, data?.refreshToken!)
    notificationCtx?.push({ type: 'message', content: 'Logged in successful' })
  }

  // keyboard
  useInput(async (input, key) => {
    if (key.tab && key.shift) {
      setFocused((prev) => (prev + 3 - 1) % 3)
    } else if (key.tab) {
      setFocused((prev) => (prev + 1) % 3)
    }
    if (key.return) {
      if (focused == 2) {
        setScreen('register')
      } else {
        await login()
      }
    }
  })

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>LOGIN</Text>
      </Box>

      <Box flexDirection="column">
        <Box flexDirection="row">
          <Text>{focused === 0 ? '> ' : ''}</Text>
          <TextInput
            focus={focused === 0}
            value={email}
            onChange={setEmail}
            placeholder="email"
          />
        </Box>

        <Box flexDirection="row">
          <Text>{focused === 1 ? '> ' : ''}</Text>
          <TextInput
            focus={focused === 1}
            value={password}
            onChange={setPassword}
            placeholder="password"
            mask="*"
          />
        </Box>

        <Box>
          <Text>
            {focused === 2 ? <Text bold>Register HERE</Text> : 'Register HERE'}
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
  )
}
