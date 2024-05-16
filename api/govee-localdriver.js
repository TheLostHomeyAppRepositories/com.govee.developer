'use strict';

const { Driver } = require('homey');
const tinycolor = require('tinycolor2');
const gv = require('./govee-localapi');


class GoveeDriver extends Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.homey.app.localApiClient = new gv.GoveeClient();
    this.log('govee.localdriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async ListDevices() {
    this.log('List available devices');
    var devicelist = null;
    devicelist = await this.homey.app.localApiClient.deviceList();
    this.log('Received '+devicelist.length+' from local discovery');
    //Convert to our Homey device info object
    var devices = await devicelist.map((device) => {
      let goveedevice = {
        id: device.deviceID,
        icon: '../../../assets/add_list_type_device_'+device.model.substring(1)+'.svg',
        name: device.model,
        data: {
          id: device.deviceID,
          name: device.deviceID,
          model: device.model,
          capabilitieslist: device.state
        }
      }
      this.log('device located: '+JSON.stringify(goveedevice));
      return goveedevice;
    });
    this.log ('listed: '+devices.length+' govee devices');
    return devices;
  }

  async turn(mode, deviceid) {
      this.log('device ('+deviceid+') state change requested ['+mode+']');
      return this.homey.app.localApiClient.devicesTurn(mode,deviceid);
  }

  async brightness(dim, deviceid) {
    //Correct dim level from percentage to the range 0-100
    var correctDimLevel = (dim*100);
		this.log('device ('+deviceid+') brightness change requested ['+correctDimLevel+']');
    return this.homey.app.localApiClient.brightness(correctDimLevel, deviceid);
  }

  async colorTemp(colortemp, deviceid) {
    //We need to correct the Homey color temp to what Govee expects
    //let rgb = this.colorCommandSetParser(hue*360,sat*100,light*100);
    let color = {
      kelvin: colortemp
    }
		this.log('device ('+deviceid+') color temp change requested ['+colortemp+'] converted to color ['+JSON.stringify(color)+']');
    return this.homey.app.localApiClient.color(color, deviceid);
  }

  async color(hue, sat, light, deviceid) {
    //We need to correct the Homey color number to RGB values
    let rgb = this.colorCommandSetParser(hue*360,sat*100,light*100);
    let color = {
      rgb: [rgb.r, rgb.g, rgb.b]
    }
		this.log('device ('+deviceid+') color change requested ['+hue+','+sat+','+light+'] converted to color ['+JSON.stringify(color)+']');
    return this.homey.app.localApiClient.color(color, deviceid);
  }

  colorCommandSetParser( hue, sat, light ) {
    var rgb = tinycolor({
      h: hue,
      s: sat,
      v: light
    }).toRgb();
    return rgb;
  }

  colorCommandGetParser(rgb)
  {
    var hsv = tinycolor({
      r: rgb.r || 0,
      g: rgb.g || 0,
      b: rgb.b || 0
    }).toHsv();
    return hsv;
  }
}

module.exports = GoveeDriver;