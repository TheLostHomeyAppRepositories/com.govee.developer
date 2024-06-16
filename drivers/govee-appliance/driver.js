'use strict';

const GoveeDriver = require('../../api/govee-driver-v2')

class goveeApplianceDriver extends GoveeDriver {

  async onInit() {
    //Setup the matching filter during pairing
    await super.onInit();
    this.goveedrivertype='appliance';
  }

}
module.exports = goveeApplianceDriver;