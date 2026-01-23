import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from './supabase'

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    return
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync()

  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return
  }

  const tokenData = await Notifications.getExpoPushTokenAsync()
  const token = tokenData.data

  await supabase.from('push_tokens').upsert(
    { token },
    { onConflict: 'token' }
  )
}
