package com.idpasssmartsharereactnative;

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
import com.facebook.react.module.annotations.ReactModule;

import org.idpass.smartshare.connection.BluetoothSecure;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;

@ReactModule(name = SmartshareReactNativeModule.NAME)
public class SmartshareReactNativeModule extends ReactContextBaseJavaModule {
    public static final String NAME = "SmartshareReactNative";
    private static final String TAG = SmartshareReactNativeModule.class.getName();
    private BluetoothSecure bluetoothSecure;

    public SmartshareReactNativeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        bluetoothSecure = new BluetoothSecure();
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
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

    ///////////////////////////////////////
    // IdpassSmartshare.tsx Javascript APIs
    ///////////////////////////////////////

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
