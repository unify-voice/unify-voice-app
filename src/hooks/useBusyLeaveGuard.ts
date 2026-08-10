import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'

type LeaveNav = {
  addListener: (
    event: 'beforeRemove',
    cb: (e: { preventDefault: () => void; data: { action: object } }) => void,
  ) => () => void
  dispatch: (action: object) => void
  setOptions: (options: { gestureEnabled?: boolean }) => void
}

type GuardConfig = {
  title: string
  message: string
  stayLabel: string
  leaveLabel: string
  onDiscard: () => void | Promise<void>
}

/** Blocks back / swipe / Return Home while busy, then discards the session on confirm. */
export function useBusyLeaveGuard(navigation: LeaveNav, busy: boolean, config: GuardConfig) {
  const busyRef = useRef(busy)
  const titleRef = useRef(config.title)
  const messageRef = useRef(config.message)
  const stayRef = useRef(config.stayLabel)
  const leaveRef = useRef(config.leaveLabel)
  const discardRef = useRef(config.onDiscard)
  const allowingRef = useRef(false)

  busyRef.current = busy
  titleRef.current = config.title
  messageRef.current = config.message
  stayRef.current = config.stayLabel
  leaveRef.current = config.leaveLabel
  discardRef.current = config.onDiscard

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !busy })
  }, [busy, navigation])

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (allowingRef.current || !busyRef.current) return
      e.preventDefault()
      Alert.alert(titleRef.current, messageRef.current, [
        { text: stayRef.current, style: 'cancel' },
        {
          text: leaveRef.current,
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await discardRef.current()
              } finally {
                allowingRef.current = true
                navigation.dispatch(e.data.action)
              }
            })()
          },
        },
      ])
    })
  }, [navigation])
}
