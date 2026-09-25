import { Box, Text } from "ink"

export type NotificationData = {
  type: 'message' | 'warning' | 'error'
  content: string
}

export default function Notification(notification: NotificationData) {
  switch (notification.type) {
    case 'message':
      return (
        <Box borderStyle={'single'} borderColor={'#2BA429'}>
          <Text>{notification.content}</Text>
        </Box>
      )
    case 'warning':
      return (
        <Box borderStyle={'single'} borderColor={'#A49E29'}>
          <Text>Warning: {notification.content}</Text>
        </Box>
      )
    case 'error':
      return (
        <Box borderStyle={'single'} borderColor={'#A4292B'}>
          <Text>Error: {notification.content}</Text>
        </Box>
      )
  }
}
