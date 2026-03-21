/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { handleNotificationAction } from './src/api/notificationHandlers';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (
    type === EventType.PRESS ||
    type === EventType.ACTION_PRESS ||
    type === EventType.DELIVERED
  ) {
    await handleNotificationAction(type, detail);
  }
});

AppRegistry.registerComponent(appName, () => App);
