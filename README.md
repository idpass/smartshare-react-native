# SmartShare React Native

A Secure Communications Library For Sharing Credentials

## Installation

```bash
# Using npm
npm install @idpass/smartshare-react-native

# Using yarn
yarn add @idpass/smartshare-react-native
```

## Usage

Import in main app:

```javascript
import BluetoothApi from '@idpass/smartshare-react-native';
```

## Development

The use of Java version 1.8 is recommended and has been tested to be smoothly compatible for this project. This project was generated using [`create-react-native-library`](https://www.npmjs.com/package/create-react-native-library) to bootstrap the project structure and settings.

```bash
git clone https://github.com/idpass/smartshare-react-native
cd smartshare-react-native
yarn
yarn example start

# In a separate terminal window:
cd smartshare-react-native
yarn example android
```

## Bluetooth API Description

First, a connection code or `params` needs to be communicated out-of-band and not via this library. This connection code specifies the intended peer to connect to. The mechanism to communicate the `params` connection code is up to the application. Such mechanism would include, but is not limited to, through a QR code for example.

The app that _displays the QR code_ shall generate the ephemeral connection parameters:

```javascript
import BluetoothApi from '@idpass/smartshare-react-native';

const params = BluetoothApi.getConnectionParameters();
console.log(params);

// Use any out-of-band mechanism to communicate the value of params to the peer device.
// For example, you can use a QR code generator library to visually display params.
```

The connection code or `params` looks like:

```json
{
  "cid": "1ejpu",
  "pk": "819176777955C098B78BAF949084A4484AEC5A769CED2307D59E46DC85A0F758"
}
```

The app that _scans the QR code_ shall set its connection parameters:

```javascript
// Use any out-of-band mechanism to get the value of params from the peer device.
// For example, you can use a QR code scanning library to get params.

BluetoothApi.setConnectionParameters(params);
```

Both apps create the connection:

```javascript
BluetoothApi.createConnection('dual', () => {
  // A secure Bluetooth connection is created
  // Anytime, either app may call BluetoothApi.send()
});
```

Once the connection is created, either app can send a string message.

```javascript
BluetoothApi.send(message, () => {
  // message sent
});
```

The app can intentionally destroy the connection.

```javascript
BluetoothApi.destroyConnection();
```

The app must handle _Nearby_ events in order to receive **messages**, to monitor transfer **status** of incoming/outgoing messages, or to monitor connection related **events**:

```javascript
BluetoothApi.handleNearbyEvents((event) => {
  switch (event.type) {
    case 'msg':
      console.log(event.data);
      break;

    case 'onDisconnected':
      console.log('onDisconnected: ' + event.data);
      break;

    case 'transferupdate':
      console.log('transferupdate: ' + event.data);
      break;

    default:
      break;
  }
});
```

The React Native app can print native debug **logs** for debugging, by:

```javascript
BluetoothApi.handleLogEvents(event => {
  console.log(event.log);
});
```

## Non-dual Bluetooth Connection Creation Mode

The above example snippets illustrated the use of the **dual** Bluetooth connection creation mode, wherein both devices will actively attempt to connect to each other and depending on who does it first, a connection is thereby created. The **dual** mode is a more robust mechanism to create a connection. However, an application may opt to configure one device as the `advertiser` and the other as the `discoverer`. For example, the first app that displays the QR code will advertise its presence and waits for a connection by:

```javascript
BluetoothApi.createConnection('advertiser', () => {
  // A secure Bluetooth connection is created
  // Anytime, either app may call BluetoothApi.send()
});
```

and the other app that scans the QR code will attempt to discover the first app by:

```javascript
BluetoothApi.createConnection('discoverer', () => {
  // A secure Bluetooth connection is created
  // Anytime, either app may call BluetoothApi.send()
});
```

This secure Bluetooth communication library needs to be used with another mechanism, for example a QR code, for the exchange of a connection parameters (params). This library uses asymmetric cryptography with ephemeral keys to secure the payload with [Authenticated Encryption](https://en.wikipedia.org/wiki/Authenticated_encryption).

## Open source dependencies

- [idpass-smartshare](https://github.com/idpass/idpass-smartshare)
- [lazysodium-android](https://github.com/terl/lazysodium-android)

## License

[Apache-2.0 License](LICENSE)
