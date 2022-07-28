/*
 * Copyright (C) 2021 Newlogic Pte. Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@idpass/smartshare-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const IdpassSmartshare = NativeModules.IdpassSmartshare
  ? NativeModules.IdpassSmartshare
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

IdpassSmartshare.noop; // to trigger iOS autolink

interface HandlerFunc {
  (message: string): void;
}

if (Platform.OS === 'android') {
  const eventEmitter = new NativeEventEmitter();
  IdpassSmartshare.handleNearbyEvents = (callback: HandlerFunc) =>
    eventEmitter.addListener('EVENT_NEARBY', callback);
  IdpassSmartshare.handleLogEvents = (callback: HandlerFunc) =>
    eventEmitter.addListener('EVENT_LOG', callback);
} else if (Platform.OS === 'ios') {
  IdpassSmartshare.handleNearbyEvents = () => ({ remove: () => {} });
  IdpassSmartshare.handleLogEvents = () => ({ remove: () => {} });
}

export default IdpassSmartshare;
