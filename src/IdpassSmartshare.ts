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

import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const LINKING_ERROR =
  `The package '@idpass/smartshare-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const IdpassSmartshare: IdpassSmartshare = NativeModules.IdpassSmartshare
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

if (Platform.OS === 'android') {
  const eventEmitter = new NativeEventEmitter();
  IdpassSmartshare.handleNearbyEvents = (callback) =>
    eventEmitter.addListener('EVENT_NEARBY', callback);
  IdpassSmartshare.handleLogEvents = (callback) =>
    eventEmitter.addListener('EVENT_LOG', callback);
} else if (Platform.OS === 'ios') {
  IdpassSmartshare.handleNearbyEvents = () =>
    ({ remove: () => {} } as EmitterSubscription);
  IdpassSmartshare.handleLogEvents = () =>
    ({ remove: () => {} } as EmitterSubscription);
}

export default IdpassSmartshare;

export interface IdpassSmartshare {
  /**
   * Do not invoke. Only used to trigger autolink in iOS builds.
   */
  noop: () => void;

  getConnectionParameters: () => string;

  setConnectionParameters: (params: string) => void;

  getConnectionParametersDebug: () => string;

  createConnection: (mode: ConnectionMode, callback: () => void) => void;

  destroyConnection: () => void;

  send: (message: string, callback: () => void) => void;

  handleNearbyEvents: (
    callback: (event: NearbyEvent) => void
  ) => EmitterSubscription;

  handleLogEvents: (
    callback: (event: NearbyLog) => void
  ) => EmitterSubscription;
}

export type ConnectionMode = 'dual' | 'advertiser' | 'discoverer';

export type TransferUpdateStatus =
  | 'SUCCESS'
  | 'FAILURE'
  | 'IN_PROGRESS'
  | 'CANCELED';

export type NearbyEvent =
  | { type: 'msg'; data: string }
  | { type: 'transferupdate'; data: TransferUpdateStatus }
  | { type: 'onDisconnected'; data: string };

export interface NearbyLog {
  log: string;
}

export interface ConnectionParams {
  cid: string;
  pk: string;
}
