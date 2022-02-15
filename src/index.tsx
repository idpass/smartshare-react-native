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

import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const LINKING_ERROR =
  `The package '@idpass/smartshare-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const BluetoothApi = NativeModules.BluetoothApi
  ? NativeModules.BluetoothApi
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

interface HandlerFunc {
  (message: string): void;
}

const eventEmitter = new NativeEventEmitter();

BluetoothApi.handleNearbyEvents = (callback :HandlerFunc) => {
  var eventObj = eventEmitter.addListener('EVENT_NEARBY', (event) => {
    callback(event)
  })
  return eventObj
}

BluetoothApi.handleLogEvents = (callback :HandlerFunc) => {
  var eventObj = eventEmitter.addListener('EVENT_LOG', (event) => {
    callback(event)
  })
  return eventObj
}

export default BluetoothApi;
