import { LogBox, Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let loading: Promise<NotificationsModule | null> | null = null;

LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported',
  '[expo-notifications]',
]);

function load() {
  if (Platform.OS === 'web') return Promise.resolve(null);
  if (!loading) {
    loading = (async () => {
      try {
        const Notifications = await import('expo-notifications');
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: false,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('timer', {
            name: 'Cronômetro',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 500, 300, 500],
          });
        }
        const { granted } = await Notifications.requestPermissionsAsync();
        return granted ? Notifications : null;
      } catch {
        return null;
      }
    })();
  }
  return loading;
}

export async function scheduleTimerAlert(seconds: number, body: string) {
  const Notifications = await load();
  if (!Notifications) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'Tempo esgotado!', body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId: 'timer',
      },
    });
  } catch {
    return null;
  }
}

export async function cancelTimerAlert(id: string | null) {
  if (!id) return;
  const Notifications = await load();
  Notifications?.cancelScheduledNotificationAsync(id).catch(() => {});
}
