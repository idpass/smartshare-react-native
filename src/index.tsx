import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package '@idpass/smartshare-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const SmartshareReactNative =
  NativeModules.SmartshareReactNative
    ? NativeModules.SmartshareReactNative
    : new Proxy({}, {
        get() {
          throw new Error(LINKING_ERROR);
        },
      });

if (Platform.OS === 'android') {
  const eventEmitter = new NativeEventEmitter();
  SmartshareReactNative.handleNearbyEvents = (callback: HandlerFunc) =>
    eventEmitter.addListener('EVENT_NEARBY', callback);
  SmartshareReactNative.handleLogEvents = (callback: HandlerFunc) =>
    eventEmitter.addListener('EVENT_LOG', callback);
} else if (Platform.OS === 'ios') {
  SmartshareReactNative.handleNearbyEvents = () => ({ remove: () => {} });
  SmartshareReactNative.handleLogEvents = () => ({ remove: () => {} });
}

export default SmartshareReactNative;


interface HandlerFunc {
  (message: string): void;
}