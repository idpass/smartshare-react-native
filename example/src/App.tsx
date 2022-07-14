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

/**
 * An example minimal React Native test application that uses
 * the '@idpass/smartshare-react-native' library in conjunction
 * with third-party QR code libraries.
 */

import React from 'react';
import type { Node } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import QRCode from 'react-native-qrcode-svg';
import { MD5, isQRValid, getRandomString } from './Helper';
import QRCodeScanner from 'react-native-qrcode-scanner';
import IdpassSmartshare from '@idpass/smartshare-react-native';

const Section = ({ children, title }): Node => {
  const isDarkMode = false;
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.GetConnectionParameters = this.GetConnectionParameters.bind(this);
    this.SetConnectionParameters = this.SetConnectionParameters.bind(this);
    this.Disconnect = this.Disconnect.bind(this);
    this.onScan = this.onScan.bind(this);
    this.Send = this.Send.bind(this);
    this.Discover = this.Discover.bind(this);
    this.Advertise = this.Advertise.bind(this);

    this.state = {
      page: 0,
      msg: '',
      checksum: '',
      params: 'hello',
      color: 'gray',
      logmsg: '',
      qrButtonDisabled: false,
      scanButtonDisabled: false,
      disconButtonDisabled: true,
      sendButtonDisabled: true,
      discoverButtonDisabled: false,
      advertiseButtonDisabled: false,
      searchmsg: '',
    };
  }

  componentDidMount() {
    this.nearbyEvents = IdpassSmartshare.handleNearbyEvents((event) => {
      console.log(event.type);
      switch (event.type) {
        case 'msg':
          var alphaOmega =
            event.data.substr(0, 20) +
            event.data.substr(event.data.length - 20);
          this.setState({
            msg: alphaOmega,
            checksum: MD5(event.data),
          });
          break;

        case 'onDisconnected':
          console.log('onDisconnected:' + event.data);
          this.setState({
            checksum: '',
            msg: '',
            params: 'hello',
            qrButtonDisabled: false,
            scanButtonDisabled: false,
            disconButtonDisabled: true,
            sendButtonDisabled: true,
            advertiseButtonDisabled: false,
            discoverButtonDisabled: false,
            searchmsg: '',
          });
          break;

        case 'transferupdate':
          console.log('transferupdate:' + event.data);
          this.setState({
            checksum: event.data,
            sendButtonDisabled: event.data < 1.0 ? true : false,
          });
          break;

        case 'onEndpointFound':
          console.log('found ' + event.data);
          break;

        default:
          break;
      }
    });

    this.LogEvents = IdpassSmartshare.handleLogEvents((event) => {
      var logmsg =
        (this.state.logmsg ? this.state.logmsg : '') + '\n' + event.log;
      this.setState({
        logmsg: logmsg,
      });
    });
  }

  componentWillUnmount() {
    if (this.NearbyEvents) {
      this.nearbyEvents.remove();
    }

    if (this.LogEvents) {
      this.LogEvents.remove();
    }
  }

  GetConnectionParameters() {
    var params = JSON.parse(IdpassSmartshare.getConnectionParameters());
    this.setState({
      qrButtonDisabled: true,
      scanButtonDisabled: true,
      msg: '',
      checksum: '',
      color: 'black',
      params: {
        cid: params.cid,
        pk: params.pk,
      },
    });

    IdpassSmartshare.createConnection('dual', () => {
      console.log('-- connected ---');
      this.setState({
        page: 0,
        params: 'hello',
        color: 'gray',
        disconButtonDisabled: false,
        sendButtonDisabled: false,
      });
    });
  }

  SetConnectionParameters() {
    this.setState({
      page: 1,
      msg: '',
      checksum: '',
      qrButtonDisabled: true,
      scanButtonDisabled: true,
    });
  }

  onScan(qr) {
    if (!isQRValid(qr)) {
      console.log('QR code is invalid');
      this.setState({
        page: 0,
        msg: 'INVALID CONNECTION CODE',
        qrButtonDisabled: false,
        scanButtonDisabled: false,
      });
      return;
    }

    IdpassSmartshare.setConnectionParameters(qr.data);
    IdpassSmartshare.createConnection('dual', () => {
      console.log('-- connected ---');
      this.setState({
        page: 0,
        params: 'hello',
        color: 'gray',
        disconButtonDisabled: false,
        sendButtonDisabled: false,
      });
    });

    this.setState({
      page: 0,
    });
  }

  Disconnect() {
    console.log('*** Disconnect ***');
    IdpassSmartshare.destroyConnection();

    this.setState({
      qrButtonDisabled: false,
      scanButtonDisabled: false,
      disconButtonDisabled: true,
      sendButtonDisabled: true,
      searchmsg: '',
      advertiseButtonDisabled: false,
      discoverButtonDisabled: false,
    });
  }

  Send() {
    let msg = 'alpha 9MB payload ' + getRandomString(9000000) + ' omega';
    var alphaOmega = msg.substr(0, 20) + msg.substr(msg.length - 20);

    this.setState({
      msg: '',
      checksum: '',
      sendButtonDisabled: true,
    });

    IdpassSmartshare.send(msg, () => {
      console.log('*** sent ***');
      this.setState({
        checksum: MD5(msg),
        msg: alphaOmega,
        sendButtonDisabled: false,
      });
    });
  }

  Discover() {
    var params = IdpassSmartshare.getConnectionParametersDebug();
    IdpassSmartshare.setConnectionParameters(params);

    this.setState({
      advertiseButtonDisabled: true,
      discoverButtonDisabled: true,
      searchmsg: 'Searching ...',
    });

    IdpassSmartshare.createConnection('discoverer', () => {
      console.log('-- connected ---');
      this.setState({
        page: 0,
        searchmsg: 'i see you',
      });
    });
  }

  Advertise() {
    var params = IdpassSmartshare.getConnectionParametersDebug();
    IdpassSmartshare.setConnectionParameters(params);

    this.setState({
      advertiseButtonDisabled: true,
      discoverButtonDisabled: true,
      searchmsg: 'Waiting to be found ...',
    });

    IdpassSmartshare.createConnection('advertiser', () => {
      console.log('-- connected ---');
      this.setState({
        page: 0,
        searchmsg: 'you see me!',
      });
    });
  }

  render() {
    switch (this.state.page) {
      case 0:
        return (
          <SafeAreaView style={{ backgroundColor: Colors.white }}>
            <ScrollView>
              <View>
                <Section title="example 0.0.1">
                  <Button
                    title="QR"
                    disabled={this.state.qrButtonDisabled}
                    onPress={this.GetConnectionParameters}
                  />
                  <View style={styles.space} />
                  <Button
                    title="Scan"
                    disabled={this.state.scanButtonDisabled}
                    onPress={this.SetConnectionParameters}
                  />
                  <View style={styles.space} />
                  <Button
                    title="Discon"
                    disabled={this.state.disconButtonDisabled}
                    onPress={this.Disconnect}
                  />
                  <View style={styles.space} />
                  <Button
                    title="Send"
                    disabled={this.state.sendButtonDisabled}
                    onPress={this.Send}
                  />
                </Section>
                <Section title="connection code">
                  <QRCode
                    size={200}
                    color={this.state.color}
                    value={JSON.stringify(this.state.params)}
                  />
                </Section>
                <Section title="visibility check">
                  <Button
                    title="discover"
                    disabled={this.state.discoverButtonDisabled}
                    onPress={this.Discover}
                  />
                  <View style={styles.space} />
                  <Button
                    title="advertise"
                    disabled={this.state.advertiseButtonDisabled}
                    onPress={this.Advertise}
                  />
                  <View style={styles.space} />
                  <Button title="DISCON" onPress={this.Disconnect} />
                </Section>
                <Section title="visibility result">
                  <Text>{this.state.searchmsg}</Text>
                </Section>
                <Section title="checksum">
                  <Text>{this.state.checksum}</Text>
                </Section>
                <Section title="message">
                  <Text>{this.state.msg}</Text>
                </Section>
                <Section title="log">
                  <Button
                    title="Clear"
                    onPress={() => {
                      this.setState({ logmsg: '' });
                    }}
                  />
                  <Text>{this.state.logmsg}</Text>
                </Section>
              </View>
            </ScrollView>
          </SafeAreaView>
        );

      case 1:
        return (
          <QRCodeScanner
            onRead={this.onScan}
            bottomContent={
              <Text style={{ fontWeight: 'bold' }}>
                Scan QR Connection Code
              </Text>
            }
          />
        );
    } // switch
  } // render
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  space: {
    width: 20,
    height: 20,
  },
  whitebg: {
    backgroundColor: '#FFFFFF',
  },
  centerplace: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});

export default App;
