//A small rip from https://github.com/chris01b/Govee-API-Client/blob/master/index.js
//Seems like a good start for athe api client but is not complete and not published as npm package.
//All credits go to chris01b for this great start

//New API Implementation
//https://openapi.api.govee.com/router/api/v1/user/devices

const fetch = require('isomorphic-unfetch');

class GoveeClient {
  constructor(config) {
    this.api_key = config.api_key;
    this.basePath = "https://openapi.api.govee.com/router/api/v1";
  }

  request(endpoint = "", options = {}) {
    let url = this.basePath + endpoint;
    
    let headers = {
      'Govee-API-Key': this.api_key,
      'Content-type': 'application/json'
    };

    let config = {
        ...options,
        headers
    };

    console.log('Call to '+url+' with config '+JSON.stringify(options));

    return fetch(url, config).then((r) => r.json())
    .then((data) => {
      //console.log(data);
      if(data.code==200)
      {
        return data;
      } 
      throw new Error(data);      
    });      
  }

  ping() {
    let config = {
      method: 'GET'
    };
    return this.request("/ping", config);
  }

  deviceList() {
    let config = {
      method: 'GET'
    };
    return this.request("/user/devices", config);
  }

  deviceControl(body) {
    const config = {
      method: 'POST',
      body: JSON.stringify(body)
    }
    return this.request("/device/control", config);
  }

  postStateRequest(body) {
    const config = {
      method: 'POST',
      body: JSON.stringify(body)
    };
    return this.request('/device/state', config);
  }

  postDynamicScenesRequest(body) {
    const config = {
      method: 'POST',
      body: JSON.stringify(body)
    };
    return this.request('/device/scenes', config);
  }

  postDiyScenesRequest(body) {
    const config = {
      method: 'POST',
      body: JSON.stringify(body)
    };
    return this.request('/device/diy-scenes', config);
  }

  state(model, device) {
    return new Promise((resolve, reject) => {
        //console.log('attempt to retrieve state for device ['+device+':'+model+']');
        let params = {
          "requestId": "uuid",
          "payload": {
              "sku": model,
              "device": device
          }
        };
        this.postStateRequest(params).then(res => {
            resolve(res.payload);
        }).catch(e => {reject(e)});
    });
  }

  lightModes(model, device) {
    return new Promise((resolve, reject) => {
        //console.log('attempt to retrieve light modes for device ['+device+':'+model+']');
        let params = {
          "requestId": "uuid",
          "payload": {
              "sku": model,
              "device": device
          }
        };
        this.postDynamicScenesRequest(params).then(res => {
            resolve(res.payload);
        }).catch(e => {reject(e)});
    });
  }

  diyLightModes(model, device) {
    return new Promise((resolve, reject) => {
        //console.log('attempt to retrieve DiY light modes for device ['+device+':'+model+']');
        let params = {
          "requestId": "uuid",
          "payload": {
              "sku": model,
              "device": device
          }
        };
        this.postDiyScenesRequest(params).then(res => {
            resolve(res.payload);
        }).catch(e => {reject(e)});
    });
  }

  setLightScene(scene, instance, model, device) {
    return new Promise((resolve, reject) => {
      //console.log('attempt to switch device ['+device+':'+model+'] to new mode: '+scene)
      let params = {
        "requestId": "uuid",
        "payload": {
          "sku": model,
          "device": device,
          "capability": {
            "type": "devices.capabilities.dynamic_scene",
            "instance": instance,
            "value": scene
            }
          }
        }
        this.deviceControl(params).then(res => {
          resolve(res);
        }).catch(e => {reject(e)});
      });
  }

  devicesTurn(mode, model, device) {
    return new Promise((resolve, reject) => {
      if ((mode != 1 && mode != 0)) {
        reject(new Error("Incorrect turn parameter"));
      } else {
        //console.log('attempt to switch device ['+device+':'+model+'] to new mode: '+mode)
        let params = {
          "requestId": "uuid",
          "payload": {
            "sku": model,
            "device": device,
            "capability": {
              "type": "devices.capabilities.on_off",
              "instance": "powerSwitch",
              "value": mode
            }
          }
        }
        this.deviceControl(params).then(res => {
          resolve(res);
        }).catch(e => {reject(e)});
      }
    });
  }
  
  
  devicesMode(mode, model, device) {
  return new Promise((resolve, reject) => {
      //console.log('attempt to switch device ['+device+':'+model+'] to new mode: '+mode)
      let params = {
        'device': device,
        'model': model,
        'cmd' : {
          'name': 'mode',
          'value': mode
        }
      };
      this.deviceControl(params).then(res => {
        resolve(res);
      }).catch(e => {reject(e)});
    });
  }
  

  brightness(dim, model, device) {
    return new Promise((resolve, reject) => {
      if (dim < 0 | dim > 100) {
        reject(new Error("Incorrect dim level"));
      } else {
        //console.log('attempt dim device ['+device+':'+model+'] to new level: '+dim)
        let params = {
          "requestId": "uuid",
          "payload": {
            "sku": model,
            "device": device,
            "capability": {
              "type": "devices.capabilities.range",
              "instance": "brightness",
              "value": dim
            }
          }
        };
        this.deviceControl(params).then(res => {
          resolve(res);
        }).catch(e => {reject(e)});
      }
    });
  }

  //Ensure that the colortemp fits the range specified by the device properties
  colorTemp(colortemp, model, device) {
    return new Promise((resolve, reject) => {
        //console.log('attempt set color temp of device ['+device+':'+model+'] to new temp: '+colortemp)
        let params = {
          "requestId": "uuid",
          "payload": {
            "sku": model,
            "device": device,
            "capability": {
              "type": "devices.capabilities.color_setting",
              "instance": "colorTemperatureK",
              "value": colortemp
            }
          }
        };
        this.deviceControl(params).then(res => {
            resolve(res);
        }).catch(e => {reject(e)});
    });
  }

  //Color object needs to be hex to int converted
  color(color, model, device) {
    return new Promise((resolve, reject) => {
        //console.log('attempt set color of device ['+device+':'+model+'] to new color: '+JSON.stringify(color));
        let params = {
          "requestId": "uuid",
          "payload": {
            "sku": model,
            "device": device,
            "capability": {
              "type": "devices.capabilities.color_setting",
              "instance": "colorRgb",
              "value": color
            }
          }
        };
        this.deviceControl(params).then(res => {
          resolve(res);
        }).catch(e => {reject(e)});
    });
  }

}

exports.GoveeClient = GoveeClient;