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

package com.reactnativeidpasssmartshare;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Callback;

import org.idpass.smartshare.connection.BluetoothSecure;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

public class BluetoothApi extends ReactContextBaseJavaModule {

    private static final String TAG = BluetoothApi.class.getName();
    private BluetoothSecure bluetoothSecure;

    public BluetoothApi(ReactApplicationContext reactContext) {
        super(reactContext);
        bluetoothSecure = new BluetoothSecure();
    }

    @NonNull
    @Override
    public String getName() {
        return "BluetoothApi";
    }

    private void emitEvent(String eventName, @Nullable WritableMap data) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, data);
    }

    private void emitEventLog(String log) {
        WritableMap data = Arguments.createMap();
        data.putString("log", log);
        emitEvent("EVENT_LOG", data);
    }

    private void emitEventNearby(String msg) {
        try {
            WritableMap data = Arguments.createMap();
            JSONObject json = new JSONObject(msg);
            Iterator<String> keys = json.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                String value = json.getString(key);
                data.putString(key, value);
            }
            emitEvent("EVENT_NEARBY", data);
        } catch (JSONException e) {
            emitEventLog(e.getMessage());
        }
    }

    private void init() {
        bluetoothSecure.init(getCurrentActivity(),
            (log) -> {
                emitEventLog(log);
            }, (msg) -> {
                emitEventNearby(msg);
        });
    }

      ///////////////////////////////////
     // BluetoothApi.tsx Javascript APIs
    ///////////////////////////////////

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getConnectionParameters() {
        String params = bluetoothSecure.getConnectionParameters();
        return params;
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void setConnectionParameters(String params) {
        Log.d(TAG, "****** setConnectionParameters: " + params);
        bluetoothSecure.setConnectionParameters(params);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getConnectionParametersDebug() {
        String params = bluetoothSecure.getConnectionParametersDebug();
        return params;
    }

    @ReactMethod
    public void createConnection(String modeStr, Callback callback) {
        init();
        BluetoothSecure.Mode mode = BluetoothSecure.Mode.valueOf(modeStr);
        bluetoothSecure.createConnection(mode, (event, info) -> {
            switch (event) {
                case ONCONNECTIONRESULT_SUCCESS:
                callback.invoke();
                break;
            }
        });
    }

  @ReactMethod
    public void send(String msg, Callback callback) {
        bluetoothSecure.send(msg, (event, info) -> {
            switch (event) {
                case ONSENT:
                callback.invoke();
                break;
            }
        });
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public void destroyConnection() {
        bluetoothSecure.destroyConnection();
    }
}
