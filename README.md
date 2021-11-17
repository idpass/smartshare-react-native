# react-native-idpass-smartshare

A Secure Communications Library For Sharing Credentials

## Installation

```sh
npm install react-native-idpass-smartshare
```

## Usage

Import in main app:

```javascript
import BluetoothApi from "react-native-idpass-smartshare"
```

## Bluetooth API Description

First, a connection code or `params` needs to be communicated out-of-band and not via this library. This connection code specifies the intended peer to connect to. The mechanism to communicate the `params` connection code is up to the application. Such mechanism would include, but is not limited to, through a QR code for example.

The app that *displays the QR code* shall generate the ephemeral connection parameters:

```javascript
var params = BluetoothApi.getConnectionParameters()
console.log(params)

// Use any out-of-band mechanism to communicate the value of params to the peer device.
// For example, you can use a QR code generator library to visually display params.
```
The connection code or `params` looks like:

```javascript
{
  "cid": "1ejpu",
  "pk": "819176777955C098B78BAF949084A4484AEC5A769CED2307D59E46DC85A0F758"
}
```

The app that *scans the QR code* shall set its connection parameters:

```javascript
// Use any out-of-band mechanism to get the value of params of the peer device.
// For example, you can use a QR code scanning library to get params

BluetoothApi.setConnectionParameters(params)
```

Both apps create the connection:

```javascript
BluetoothApi.createConnection("dual", () => {
  // A secure Bluetooth connection is created
  // Anytime, either app may call BluetoothApi.send()
})
```

Once the connection is created, either app can send a string message. 

```javascript
BluetoothApi.send(msg, () => {
  // message sent
})
```

The app can intentionally destroy the connection. 

```javascript
BluetoothApi.destroyConnection()
```

The app must handle *Nearby* events in order to receive **messages**, to monitor transfer **status** of incoming/outgoing messages, or to monitor connection related **events**:

```javascript
BluetoothApi.handleNearbyEvents((event) => {
    switch (event.type) {
    case "msg":
    console.log(event.data)
    break;

    case "onDisconnected":
    console.log("onDisconnected:" + event.data)
    break;

    case "transferupdate":
    console.log("transferupdate:" + event.data)
    break;

    default:
    break;
  }

})
```

The React Native app can print native debug **logs** for debugging, by:

```javascript
BluetoothApi.handleLogEvents((event) => {
  console.log(event.log)
})
```

This secure Bluetooth communication library needs to be used with another mechanism, for example a QR code, for the exchange of a connection parameters (params). This library uses asymmetric cryptography with ephemeral keys to secure the payload with [Authenticated Encryption](https://en.wikipedia.org/wiki/Authenticated_encryption).

## Open source dependencies

- [idpass-smartshare](https://github.com/idpass/idpass-smartshare)
- [lazysodium-android](https://github.com/terl/lazysodium-android)
