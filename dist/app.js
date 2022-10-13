(() => {
  // src/js/helpers/regexp.js
  var isDisabled = /^ *;/;
  var isCategory = /^ *;?\[.*\]/;
  var isValue = /^ *;?[^\.\n]*=.*/;
  var cleanName = /[ ;\[\]]/g;
  var isDigit = /^[a-zA-Z0-9]*\.[a-zA-Z0-9]*( [0-9\-]*){4}/;
  var isReference = /^[^ ]*( [0-9\-]*){2}/;
  var isNumberValue = /^ *;?[^\n=\.]*\.[^\n=\.]*=.*/;

  // src/js/models/category.js
  var Category = class {
    name = "default";
    found = false;
    enabled = false;
    line = "";
    constructor(n = {}) {
      if (n.name)
        this.name = n.name;
      if (n.line)
        this.line = n.line;
      if (n.found)
        this.found = n.found;
      if (n.enabled)
        this.enabled = n.enabled;
    }
    static categoryToLine(name, data) {
      return `${data.enabled ? "" : ";"}[${name}]`;
    }
    setFound(boole = true) {
      this.found = boole;
      return this;
    }
    setLine(l) {
      this.line = l;
      return this;
    }
    checkEnable() {
      this.enabled = !isDisabled.test(this.line);
      return this;
    }
  };

  // src/js/models/param.js
  var Param = class {
    found = false;
    enabled = false;
    line = -1;
    anzParam = 1;
    Numbers = false;
    checkRegExList = null;
    help = "";
    constructor(p = {}) {
      if (p.found)
        this.found = p.found;
      if (p.enabled)
        this.enabled = p.enabled;
      if (p.line)
        this.line = p.line;
      if (p.anzParam)
        this.anzParam = p.anzParam;
      for (let i = 1; i <= this.anzParam; i++) {
        this["value" + i] = "";
      }
      if (p.Numbers)
        this.Numbers = p.Numbers;
      if (p.checkRegExList)
        this.checkRegExList = p.checkRegExList;
      if (p.help)
        this.help = p.help;
    }
    fromLine(l) {
      if (!isValue.test(l))
        return false;
      const split = l.split("=");
      const value_split = split[1].trim().split(" ");
      this.setLine(l).setFound().checkEnable();
      for (let i = 1; i <= value_split.length; i++) {
        this.setValue(i, value_split[i - 1]);
      }
      return true;
    }
    toLine(name) {
      let ret = `${!this.enabled ? ";" : ""}${name} =`;
      for (let i = 1; i <= this.anzParam; i++) {
        ret += " " + this["value" + i];
      }
      console.log("toLine ", ret);
      return ret;
    }
    setFound(boole = true) {
      this.found = boole;
      return this;
    }
    checkEnable(boole) {
      if (boole !== void 0)
        this.enabled = boole;
      else
        this.enabled = !isDisabled.test(this.line);
      return this;
    }
    setLine(l) {
      this.line = l;
      return this;
    }
    setValue(number, value, reset = true) {
      this.setFound(true);
      let key = "value" + number;
      if (!reset && this[key] && this[key] != void 0)
        return;
      this[key] = value;
      return this;
    }
  };

  // src/js/models/configuration.js
  var Configuration = class {
    MakeImage = {
      LogImageLocation: new Param({ help: "Location to store raw images for logging" }),
      WaitBeforeTakingPicture: new Param({ help: "Wait time between illumination switch on and take the picture (in seconds)" }),
      LogfileRetentionInDays: new Param({ help: 'Time to keep the raw image (in days -"0" = forever)' }),
      Brightness: new Param({ help: 'Image Brightness (-2 .. 2 - default = "0"). Remark: camera driver is not fully supporting this setting yet (no impact on image)' }),
      Contrast: new Param({ help: 'Image Contrast (-2 .. 2 - default = "0"). Remark: camera driver is not fully supporting this setting yet (no impact on image) ' }),
      Saturation: new Param({ help: 'Image Saturation (-2 .. 2 - default = "0") ' }),
      LEDIntensity: new Param({ help: "Internal LED Flash Intensity (PWM from 0% - 100%). Remark: as the camera autoillumination settings are used, this is rather for energy saving, than reducingreflections." }),
      ImageQuality: new Param({ help: 'Quality index for picture (default = "12" - "0" high ... "63" low). Remark: values smaller than 12 can result in a reboot, as the bigger sized JPEG might not fit in theavailable RAM!' }),
      ImageSize: new Param({ help: 'Picture size camera (default = "VGA")' }),
      FixedExposure: new Param({ help: "Fixes the illumination setting of camera at the startup and uses this later --> individual round is faster." }),
      Negative: new Param({ help: "Ivert image color." }),
      FlipVer: new Param({ help: "" }),
      FlipHor: new Param({ help: "" })
    };
    Alignment = {
      InitialRotate: new Param({ help: "" }),
      InitialMirror: new Param({ help: "" }),
      SearchFieldX: new Param({ help: 'x size (width) in which the reference is searched (default = "20")' }),
      SearchFieldY: new Param({ help: 'y size (height) in which the reference is searched (default = "20")' }),
      AlignmentAlgo: new Param({ help: '"Default" = use only R-Channel, "HighAccuracy" = use all Channels (RGB, 3x slower),  "Fast" (First time RGB, then only check if image is shifted)' }),
      FlipImageSize: new Param({ help: "" })
    };
    Digits = {
      Model: new Param({ help: "Path to CNN model file for image recognition" }),
      CNNGoodThreshold: new Param({ help: "EXPERIMENTAL - NOT WORKING FOR ALL CNNs! - Threshold above which the classification should be to accept the value (only for digits meaningfull)" }),
      LogImageLocation: new Param({ help: "Location to store separated digits for logging" }),
      LogfileRetentionInDays: new Param({ help: 'Time to keep the separated digit images (in days -"0" = forever)' })
    };
    Analog = {
      Model: new Param({ help: "Path to CNN model file for image recognition" }),
      LogImageLocation: new Param({ help: "Location to store separated digits for logging" }),
      LogfileRetentionInDays: new Param({ help: 'Time to keep the separated digit images (in days -"0" = forever)' }),
      ModelInputSize: new Param({ anzParam: 2 })
    };
    PostProcessing = {
      PreValueUse: new Param({ help: "Enable to use the previous read value for consistency checks - also on reboots" }),
      PreValueAgeStartup: new Param({ help: "Time (in minutes), how long a previous read value is valid after reboot (default = 720 min)" }),
      AllowNegativeRates: new Param({ help: 'Set on "false" to ensure, that only positive changes are accepted (typically for counter)' }),
      ErrorMessage: new Param({ help: "Do not show error message in return value - in error case, the last valid number will be send out" }),
      CheckDigitIncreaseConsistency: new Param({ help: "Enable additional consistency check - especially zero crossing check between digits" })
    };
    MQTT = {
      Uri: new Param({ help: "URI to the MQTT broker including port e.g.: mqtt://IP-Address:Port" }),
      MainTopic: new Param({ help: "MQTT main topic, under which the counters are published. The single value will be published with the following key: MAINTOPIC/VALUE_NAME/PARAMETER  where parameters are: value, rate, timestamp, error The general connection status can be found in MAINTOPIC/CONNECTION" }),
      ClientID: new Param({ help: "ClientID to connect to the MQTT broker" }),
      user: new Param({ help: "User for MQTT authentication" }),
      password: new Param({ help: "Password for MQTT authentication" }),
      SetRetainFlag: new Param({ help: "Enable or disable the retain flag for all MQTT entries" })
    };
    InfluxDB = {
      Uri: new Param({ help: "URI of the HTTP interface to InfluxDB, without traililing slash, e.g. http://IP-Address:Port" }),
      Database: new Param({ help: "Database name in which to publish the read value." }),
      Measurement: new Param({ help: "Measurement name to use to publish the read value." }),
      user: new Param({ help: "User for InfluxDB authentication" }),
      password: new Param({ help: "Password for InfluxDB authentication" })
    };
    GPIO = {
      IO0: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/] }),
      IO1: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/] }),
      IO3: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/] }),
      IO4: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/] }),
      IO12: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/] }),
      IO13: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/] }),
      LEDType: new Param({ value1: "WS2812" }),
      LEDNumbers: new Param({ value1: 2 }),
      LEDColor: new Param({ anzParam: 3, value1: 50, value2: 50, value3: 50 })
    };
    AutoTimer = {
      AutoStart: new Param({ help: "Start the image recognition immediatly after power up. false is basically for debugging." }),
      Intervall: new Param({ help: "Intervall in which the counter is read (in minutes). Number must be greater than 3 minutes." })
    };
    Debug = {
      Logfile: new Param({ help: "Turn on/off the extended logging" }),
      LogfileRetentionInDays: new Param({ help: 'Time to keep the log files (in days - "0" = forever)' })
    };
    System = {
      TimeZone: new Param({ help: 'Time zone in POSIX syntax (Europe/Berlin = "CET-1CEST,M3.5.0,M10.5.0/3" - incl. daylight saving)' }),
      TimeServer: new Param({ help: 'Time server to synchronize system time (default: "pool.ntp.org" - used if nothing is specified)' }),
      AutoAdjustSummertime: new Param({ help: "" }),
      Hostname: new Param({ help: "Hostname for server - will be transfered to wlan.ini at next startup)" }),
      SetupMode: new Param({ help: "" })
    };
  };

  // src/js/models/number.js
  var Number2 = class {
    name = "default";
    digit = [];
    analog = [];
    PostProcessing = {
      DecimalShift: new Param(),
      ExtendedResolution: new Param(),
      IgnoreLeadingNaN: new Param(),
      MaxRateType: new Param(),
      MaxRateValue: new Param()
    };
    constructor(n) {
      if (n?.name)
        this.name = n.name;
      if (n?.digit?.length)
        this.digit = n.digit;
      if (n?.analog?.length)
        this.analog = n.analog;
    }
    digitsToLines() {
      return this.digit.map((d) => this.name + "." + d.name + " " + d.x + " " + d.y + " " + d.dx + " " + d.dy);
    }
    analogsToLines() {
      return this.analog.map((d) => this.name + "." + d.name + " " + d.x + " " + d.y + " " + d.dx + " " + d.dy);
    }
    postProcessingToLines() {
      let keys = Object.keys(this.PostProcessing);
      let ret = keys.map((pp) => {
        return `${this.PostProcessing[pp].enabled ? "" : ";"}${this.name}.${pp} = ${this.PostProcessing[pp].value1}`;
      });
      console.log(ret);
      return ret;
    }
  };

  // src/js/models/reference.js
  var Reference = class {
    name = "default";
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    constructor(r = {}) {
      if (r.name)
        this.name = r.name;
      if (r.x)
        this.x = r.x;
      if (r.y)
        this.y = r.y;
      if (r.dx)
        this.dx = r.dx;
      if (r.dy)
        this.dy = r.dy;
    }
    toLine() {
      return `${this.name} ${this.x} ${this.y}`;
    }
  };

  // src/js/models/digit.js
  var Digit = class {
    name = "default";
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    ar = 0;
    pos_ref = "";
    constructor(d = {}) {
      if (d.name)
        this.name = d.name;
      if (d.pos_ref)
        this.pos_ref = d.pos_ref;
      if (d.x)
        this.x = d.x;
      if (d.y)
        this.y = d.y;
      if (d.dx)
        this.dx = d.dx;
      if (d.dy)
        this.dy = d.dy;
      if (this.dx && this.dy)
        this.ar = parseFloat(this.dx) / parseFloat(this.dy);
    }
  };

  // src/js/models/analog.js
  var Analog = class {
    name = "default";
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    ar = 0;
    pos_ref = "";
    constructor(a = {}) {
      if (a.name)
        this.name = a.name;
      if (a.pos_ref)
        this.pos_ref = a.pos_ref;
      if (a.x)
        this.x = a.x;
      if (a.y)
        this.y = a.y;
      if (a.dx)
        this.dx = a.dx;
      if (a.dy)
        this.dy = a.dy;
      if (this.dx && this.dy)
        this.ar = parseFloat(this.dx) / parseFloat(this.dy);
    }
  };

  // src/js/app.js
  var APP = class extends EventTarget {
    MAX_FILE_SIZE = 8e3 * 1024;
    MAX_FILE_SIZE_STR = "8MB";
    P;
    C = {};
    CFG_STR = "";
    CFG_LINES = [];
    N = [];
    R = [];
    V = {
      basepath: "",
      Hostname: "",
      starttime: "",
      IP: "",
      SSID: "",
      GitBranch: "",
      GitBaseBranch: "",
      GitVersion: "",
      BuildTime: "",
      HTMLVersion: ""
    };
    blobReference = void 0;
    async init() {
      try {
        this.V.basepath = this.getbasepath();
        const config = await this.getFile("/config/config.ini");
        if (!config.ok)
          throw new Error("Cant get config.ini file from device.");
        this.CFG_STR = config.text;
        this.parseConfig();
        return true;
      } catch (e) {
        console.log("App cant init.");
        console.log(e);
        return false;
      }
    }
    async loadReferenceBlob() {
      try {
        const url = this.V.basepath + "/fileserver/config/reference.jpg";
        const res = await fetch(url);
        const blob = await res.blob();
        this.setReference(blob);
      } catch (e) {
        console.log(`ERROR LOAD IMG REFERENCE "${e}"`);
        throw e;
      }
    }
    async loadRunningValues() {
      return await Promise.all([
        ["Hostname", "/version?type=Hostname"],
        ["starttime", "/starttime"],
        ["IP", "/version?type=IP"],
        ["SSID", "/version?type=SSID"],
        ["GitBranch", "/version?type=GitBranch"],
        ["GitBaseBranch", "/version?type=GitBaseBranch"],
        ["BuildTime", "/version?type=BuildTime"],
        ["HTMLVersion", "/version?type=HTMLVersion"]
      ].map(async (value) => {
        const res = await this.get(value[1]);
        this.V[value[0]] = res.ok ? res.text : "Response error.";
      }));
    }
    async reboot() {
      return await this.init();
    }
    parseConfig() {
      this.P = new Configuration();
      this.C = {};
      Object.keys(this.P).forEach((name) => this.C[name] = new Category());
      this.CFG_LINES = this.CFG_STR.split("\n");
      let current_category;
      for (let i = 0; i < this.CFG_LINES.length; i++) {
        const l = this.CFG_LINES[i];
        if (!l.length) {
          continue;
        }
        if (isCategory.test(l)) {
          const cat_name = l.replace(cleanName, "");
          if (!this.C[cat_name]) {
            console.log(`ERROR: ${cat_name} not found.`);
            continue;
          }
          current_category = cat_name;
          this.C[cat_name].setLine(l).setFound().checkEnable();
          continue;
        }
        if (!current_category) {
          console.log("ParseConfig: File malformed, lines without category.");
          continue;
        }
        if (current_category === "Alignment" && isReference.test(l)) {
          const d = l.replace(/ {2}/g, " ").trim().split(" ");
          this.R.push(new Reference({
            name: d[0],
            x: d[1],
            y: d[2]
          }));
          continue;
        }
        if (current_category === "Digits" && isDigit.test(l)) {
          const d = l.replace(/ {2}/g, " ").replace(/\./, " ").split(" ");
          let num_i = this.N.map((n) => n.name).indexOf(d[0]);
          if (num_i === -1) {
            this.N.push(new Number2({ name: d[0] }));
            num_i = this.N.length - 1;
          }
          this.N[num_i].digit.push(new Digit({
            name: d[1],
            pos_ref: l,
            x: d[2],
            y: d[3],
            dx: d[4],
            dy: d[5]
          }));
          continue;
        }
        if (current_category === "Analog" && isDigit.test(l)) {
          const d = l.replace(/ {2}/g, " ").replace(/\./, " ").split(" ");
          let num_i = this.N.map((n) => n.name).indexOf(d[0]);
          if (num_i === -1) {
            this.N.push(new Number2({ name: d[0] }));
            num_i = this.N.length - 1;
          }
          this.N[num_i].analog.push(new Analog({
            name: d[1],
            pos_ref: l,
            x: d[2],
            y: d[3],
            dx: d[4],
            dy: d[5]
          }));
          continue;
        }
        if (current_category === "PostProcessing" && isNumberValue.test(l)) {
          const d = l.replace(/[ ;]*/g, "").replace(/\./, "=").split("=");
          let num_i = this.N.map((n) => n.name).indexOf(d[0]);
          if (num_i === -1) {
            this.N.push(new Number2({ name: d[0] }));
            num_i = this.N.length - 1;
          }
          this.N[num_i].PostProcessing[d[1]].setLine(l).checkEnable().setFound().setValue(1, d[2]);
          continue;
        }
        const value_name = l.split("=")[0].replace(cleanName, "");
        if (!this.P[current_category][value_name]) {
          console.log(`ERROR: ${current_category} - ${l}`);
          continue;
        }
        if (!this.P[current_category][value_name].fromLine(l)) {
          console.log(`ERROR: ${current_category} - ${l}`);
          continue;
        }
      }
    }
    async updateDeviceConfig() {
      this.N = this.N.filter((n) => n.analog.length + n.digit.length);
      this.CFG_LINES = [];
      for (let cat in this.P) {
        if (this.CFG_LINES.length > 0)
          this.CFG_LINES.push("");
        this.CFG_LINES.push("\n" + Category.categoryToLine(cat, this.C[cat]));
        for (let name in this.P[cat]) {
          this.CFG_LINES.push(this.P[cat][name].toLine(name));
        }
        if (cat == "Digits") {
          this.N.map((n) => this.CFG_LINES = this.CFG_LINES.concat(n.digitsToLines()));
        }
        if (cat == "Analog") {
          this.N.map((n) => this.CFG_LINES = this.CFG_LINES.concat(n.analogsToLines()));
        }
        if (cat == "Alignment") {
          this.R.map((r) => this.CFG_LINES.push(r.toLine()));
        }
        if (cat == "PostProcessing") {
          this.N.map((n) => this.CFG_LINES = this.CFG_LINES.concat(n.postProcessingToLines()));
        }
      }
      this.CFG_LINES = this.CFG_LINES.filter((l) => l != "");
      this.CFG_STR = this.CFG_LINES.join("\n") + "\n";
      const deleted = await this.deleteFile("/config/config.ini");
      if (!deleted.ok) {
        console.log(`Error deleting old device config.`);
      }
      const uploaded = await this.uploadFile("/config/config.ini", this.CFG_STR);
      if (!uploaded.ok) {
        console.log(`Error uploading new device config.`);
      }
      return uploaded.ok;
    }
    async deleteFile(filePath2) {
      console.log("Device deleteFile path: ", filePath2);
      const url = this.V.basepath + "/delete" + filePath2;
      const res = await fetch(url, { method: "POST" });
      return { ok: res.ok };
    }
    async uploadFile(filePath2, body) {
      console.log("Device uploadFile path: ", filePath2);
      const url = this.V.basepath + "/upload" + filePath2;
      const res = await fetch(url, { method: "POST", body });
      return { ok: res.ok };
    }
    async copyFile(fileFromPath, fileToPath) {
      console.log("Device copyFile from -> to: ", fileFromPath, " -> ", fileToPath);
      const url = this.V.basepath + "/editflow.html?task=copy&in=" + fileFromPath + "&out=" + fileToPath;
      const res = await fetch(url);
      return { ok: res.ok };
    }
    async getFile(filePath2) {
      console.log("Device getFile path: ", filePath2);
      const url = this.V.basepath + "/fileserver" + filePath2;
      const res = await fetch(url);
      return {
        ok: res.ok,
        text: res.ok ? await res.text() : void 0
      };
    }
    async get(path2) {
      const url = this.V.basepath + path2;
      const res = await fetch(url);
      return {
        ok: res.ok,
        text: res.ok ? await res.text() : void 0
      };
    }
    CreateNUMBER(newName) {
      if (this.N.some((n) => n.name == newName))
        return "Name does already exist, please choose another one!";
      this.N.push(new Number2({ name: newName }));
    }
    RenameNUMBER(name, newName) {
      if (this.N.some((n) => n.name == newName))
        return "Name does already exist, please choose another one!";
      for (let i = 0; i < this.N.length; ++i) {
        if (this.N[i]["name"] == name) {
          this.N[i]["name"] = newName;
          break;
        }
      }
    }
    DeleteNUMBER(name) {
      if (this.N.length == 1)
        return "The last number cannot be deleted.";
      for (let i = 0; i < this.N.length; ++i) {
        if (this.N[i]["name"] == name) {
          this.N.splice(i, 1);
          break;
        }
      }
    }
    RenameROI(numberName, roiType, roiName, newName) {
      const numberNameIndex = this.N.reduce((p, n, i) => n.name == numberName ? i : p, -1);
      if (numberNameIndex == -1)
        return "Number name does not exist!";
      const newNameExist = this.N[numberNameIndex][roiType].some((roi) => roi.name == newName);
      if (newNameExist)
        return "ROI name is already in use - please use another name";
      this.N.forEach((n, i) => n.name == numberName ? n[roiType].forEach((roi, j) => roi.name == roiName ? this.N[i][roiType][j].name = newName : null) : null);
    }
    CreateROI(numberName, roiType, name, x, y, dx, dy) {
      const numberNameIndex = this.N.reduce((p, n, i) => n.name == numberName ? i : p, -1);
      if (numberNameIndex == -1)
        return "Number name does not exist!";
      const newNameExist = this.N[numberNameIndex][roiType].some((roi) => roi.name == name);
      if (newNameExist)
        return "ROI name is already in use - please use another name";
      let d = { name, x, y, dx, dy };
      let newRoi = roiType == "digit" ? new Digit(d) : roiType == "analog" ? new Analog(d) : null;
      this.N[numberNameIndex][roiType].push(newRoi);
    }
    deleteROI(numberName, roiType, roiName) {
      const numberNameIndex = this.N.reduce((p, n, i) => n.name == numberName ? i : p, -1);
      if (numberNameIndex == -1)
        return "Number name does not exist!";
      const roiNameIndex = this.N[numberNameIndex][roiType].reduce((p, roi, i) => roi.name == roiName ? i : p, -1);
      if (roiNameIndex == -1)
        return "ROI name is does not exist";
      this.N[numberNameIndex][roiType].splice(roiNameIndex, 1);
    }
    getbasepath() {
      let host = window.location.hostname;
      host = "http://" + host;
      if (window.location.port != "") {
        host = host + ":" + window.location.port;
      }
      return host;
    }
    setReference(blobReference) {
      this.blobReference = blobReference;
      this.publicEvent("ReferenceUpdated");
    }
    publicEvent(name) {
      this.dispatchEvent(new Event(name));
    }
  };

  // src/js/components/home.js
  var app;
  var V = {
    image: document.getElementById("image"),
    value: document.getElementById("value"),
    prevalue: document.getElementById("prevalue"),
    raw: document.getElementById("raw"),
    error: document.getElementById("error"),
    timestamp: document.getElementById("timestamp"),
    statusflow: document.getElementById("statusflow"),
    panelul: document.getElementById("panelul")
  };
  async function loadStatus() {
    const res = await app.get("/statusflow.html");
    V.statusflow.innerHTML = res.ok ? res.text : "No status flow response.";
    return true;
  }
  async function loadValue(name, values) {
    const url = "/wasserzaehler.html?all=true&type=" + name;
    const res = await app.get(url);
    if (!res.ok)
      return false;
    res.text.split("\r").map((l) => l.split("	")).map((l) => {
      if (!values[l[0]])
        values[l[0]] = {};
      return values[l[0]][name] = l[1];
    });
    return true;
  }
  async function load() {
    let vals = {};
    V.timestamp.innerHTML = new Date().toISOString();
    V.image.src = `/fileserver/img_tmp/alg_roi.jpg?timestamp=${V.timestamp.innerHTML}`;
    const loads = await Promise.all([
      loadStatus(),
      loadValue("value", vals),
      loadValue("raw", vals),
      loadValue("prevalue", vals),
      loadValue("error", vals)
    ]);
    console.log(loads);
    if (loads.some((ok) => !ok)) {
      console.log(`Home error: init fail.`);
      return false;
    }
    const keys = Object.keys(vals);
    const htmldata = keys.map((v) => `
		<section>
            <h4>${v}</h4>
            <p>Last: ${vals[v]?.value}</p>
            <p>Previous: ${vals[v]?.prevalue}</p>
            <p>Raw: ${vals[v]?.raw}</p>
            <p>Errors: ${vals[v]?.error}</p>
        </section>
    `).join("");
    V.panelul.innerHTML = htmldata;
    setInterval(load, 3e5);
    return true;
  }
  async function focus() {
    await loadStatus();
    V.timestamp.innerHTML = new Date().toISOString();
    return true;
  }
  function init(_app) {
    app = _app;
    return true;
  }
  var home_default = {
    init,
    load,
    focus
  };

  // src/js/helpers/canvas.js
  var Canvas = class extends EventTarget {
    imageObj = new Image();
    canvas;
    ctx;
    rotated = false;
    mirrored = false;
    scaleW = 1;
    scaleH = 1;
    degrees = 0;
    isGrid = false;
    isPointer = false;
    rectangles = [];
    creatingRectangle = false;
    creatingRectangleFirstClick = false;
    drawTemplate = "rectangle";
    aspectRatio = void 0;
    rect = { x: 0, y: 0, dx: 0, dy: 0 };
    constructor(ca) {
      super();
      this.canvas = ca;
      this.ctx = this.canvas.getContext("2d");
      this.imageObj.addEventListener("load", this.imageOnLoad, false);
    }
    imageOnLoad = (e) => {
      this.canvas.width = this.imageObj.width;
      this.canvas.height = this.imageObj.height;
      this.redraw();
    };
    reset() {
      this.clearCtx();
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.imageObj.src = "";
      this.flipHor(false);
      this.flipVer(false);
      this.setDegrees(0);
      this.grid(false);
      this.pointer(false);
    }
    clearCtx() {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    loadUrl(url) {
      this.imageObj.src = url;
    }
    flipHor(isFlipHor) {
      if (isFlipHor) {
        this.scaleW = -1;
      } else {
        this.scaleW = 1;
      }
      this.redraw();
    }
    flipVer(FlipVer) {
      if (FlipVer) {
        this.scaleH = -1;
      } else {
        this.scaleH = 1;
      }
      this.redraw();
    }
    scale() {
      const dw = this.canvas.width;
      const dh = this.canvas.height;
      this.ctx.scale(this.scaleW, this.scaleH);
      this.ctx.translate(this.scaleW == -1 ? -dw : 0, this.scaleH == -1 ? -dh : 0);
    }
    setDegrees(degrees) {
      if (this.degrees == degrees)
        return;
      this.degrees = degrees;
      this.redraw();
    }
    rotate() {
      const dw = this.canvas.width / 2;
      const dh = this.canvas.height / 2;
      this.ctx.save();
      this.ctx.translate(dw, dh);
      this.ctx.rotate(this.degrees * Math.PI / 180);
      this.ctx.drawImage(this.imageObj, -dw, -dh);
      this.ctx.restore();
    }
    grid(active) {
      if (this.isGrid == active)
        return;
      this.isGrid = active;
      this.redraw();
    }
    gridDraw() {
      if (!this.isGrid)
        return;
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#00FF00";
      this.ctx.globalAlpha = 0.7;
      for (let i = 0; i < h; i += 50) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, i);
        this.ctx.lineTo(w, i);
        this.ctx.stroke();
      }
      this.ctx.beginPath();
      this.ctx.moveTo(0, h);
      this.ctx.lineTo(w, h);
      this.ctx.stroke();
      for (let i = 0; i < w; i += 50) {
        this.ctx.beginPath();
        this.ctx.moveTo(i, 0);
        this.ctx.lineTo(i, h);
        this.ctx.stroke();
      }
      this.ctx.beginPath();
      this.ctx.moveTo(w, 0);
      this.ctx.lineTo(w, h);
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.globalAlpha = 1;
    }
    pointer(isPointer) {
      if (this.isPointer === isPointer)
        return;
      else
        this.isPointer = isPointer;
      if (isPointer) {
        this.canvas.addEventListener("mousemove", this.pointerDraw);
      } else {
        this.canvas.removeEventListener("mousemove", this.pointerDraw, false);
      }
      this.redraw();
    }
    pointerDraw = (e) => {
      this.redraw();
      let point = this.getCoords(e);
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#FF0000";
      this.ctx.beginPath();
      this.ctx.moveTo(0, point.y);
      this.ctx.lineTo(this.canvas.width, point.y);
      this.ctx.moveTo(point.x, 0);
      this.ctx.lineTo(point.x, this.canvas.height);
      this.ctx.stroke();
    };
    addRectangle(rect4 = {
      x: 10,
      y: 10,
      dx: 10,
      dy: 10,
      template: "rectangle"
    }) {
      this.rectangles.push(rect4);
      this.redraw();
    }
    clearRectangle(i) {
      if (i == void 0)
        this.rectangles = [];
      else
        this.rectangles.splice(i, 1);
      this.redraw();
    }
    rectanglesDraw() {
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#FF0000";
      for (let ir = 0; ir < this.rectangles.length; ir++) {
        const r = this.rectangles[ir];
        if (r.template == "rectangle")
          this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);
        if (r.template == "digit") {
          this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(r.x + r.dx * 0.2, r.y + r.dy * 0.2, r.dx * 0.6, r.dy * 0.6);
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(r.x, r.y + r.dy / 2);
          this.ctx.lineTo(r.x + r.dx, r.y + r.dy / 2);
          this.ctx.stroke();
        }
        if (r.template == "analog") {
          this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);
          this.ctx.beginPath();
          this.ctx.arc(r.x + r.dx / 2, r.y + r.dy / 2, r.dx / 2, 0, 2 * Math.PI);
          this.ctx.moveTo(r.x + r.dx / 2, r.y);
          this.ctx.lineTo(r.x + r.dx / 2, r.y + r.dy);
          this.ctx.moveTo(r.x, r.y + r.dy / 2);
          this.ctx.lineTo(r.x + r.dx, r.y + r.dy / 2);
          this.ctx.stroke();
        }
      }
    }
    createRectangle(drawTemplate = "rectangle", aspectRatio) {
      if (this.creatingRectangle == true)
        this.exitCreateRectangle();
      if (aspectRatio != void 0)
        this.aspectRatio = aspectRatio;
      this.drawTemplate = drawTemplate;
      this.rect = { x: 0, y: 0, dx: 0, dy: 0 };
      if (this.creatingRectangle == true)
        this.exitCreateRectangle();
      this.creatingRectangle = true;
      this.canvas.addEventListener("mousedown", this.mouseDownRectangle);
      this.canvas.addEventListener("mouseup", this.mouseUpRectangle);
      this.canvas.addEventListener("mousemove", this.printCreatingRectangle);
    }
    exitCreateRectangle() {
      if (this.creatingRectangle == false)
        return;
      this.canvas.removeEventListener("mousedown", this.mouseDownRectangle, false);
      this.canvas.removeEventListener("mouseup", this.mouseUpRectangle, false);
      this.canvas.removeEventListener("mousemove", this.printCreatingRectangle, false);
      this.creatingRectangle = false;
      this.creatingRectangleFirstClick = false;
      this.drawTemplate = void 0;
      this.aspectRatio = void 0;
      this.redraw();
    }
    printCreatingRectangle = (e) => {
      if (!this.creatingRectangleFirstClick)
        return;
      this.redraw();
      const p = this.getCoords(e);
      const r = {
        x: p.x > this.rect.x ? this.rect.x : p.x,
        y: p.y > this.rect.y ? this.rect.y : p.y,
        dx: (p.x > this.rect.x ? p.x : this.rect.x) - (p.x > this.rect.x ? this.rect.x : p.x),
        dy: (p.y > this.rect.y ? p.y : this.rect.y) - (p.y > this.rect.y ? this.rect.y : p.y)
      };
      if (this.aspectRatio) {
        if (p.x > this.rect.x)
          r.dx = Math.round(r.dy * this.aspectRatio);
        else {
          r.dx = Math.round(r.dy * this.aspectRatio);
          r.x = this.rect.x + this.rect.dx - Math.round(r.dy * this.aspectRatio);
        }
      }
      if (this.drawTemplate == "rectangle") {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);
      }
      if (this.drawTemplate == "digit") {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#FF0000";
        this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(r.x + r.dx * 0.2, r.y + r.dy * 0.2, r.dx * 0.6, r.dy * 0.6);
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(r.x, r.y + r.dy / 2);
        this.ctx.lineTo(r.x + r.dx, r.y + r.dy / 2);
        this.ctx.stroke();
      }
      if (this.drawTemplate == "analog") {
        this.ctx.strokeRect(r.x, r.y, r.dx, r.dy);
        this.ctx.beginPath();
        this.ctx.arc(r.x + r.dx / 2, r.y + r.dy / 2, r.dx / 2, 0, 2 * Math.PI);
        this.ctx.moveTo(r.x + r.dx / 2, r.y);
        this.ctx.lineTo(r.x + r.dx / 2, r.y + r.dy);
        this.ctx.moveTo(r.x, r.y + r.dy / 2);
        this.ctx.lineTo(r.x + r.dx, r.y + r.dy / 2);
        this.ctx.stroke();
      }
    };
    mouseDownRectangle = (e) => {
      this.creatingRectangleFirstClick = true;
      this.rect = { ...this.rect, ...this.getCoords(e) };
    };
    mouseUpRectangle = (e) => {
      let p = this.getCoords(e);
      this.rect.dx = p.x - this.rect.x;
      this.rect.dy = p.y - this.rect.y;
      if (this.rect.dx < 0) {
        this.rect.dx = -this.rect.dx;
        this.rect.x -= this.rect.dx;
      }
      if (this.rect.dy < 0) {
        this.rect.dy = -this.rect.dy;
        this.rect.y -= this.rect.dy;
      }
      if (this.aspectRatio) {
        if (p.x > this.rect.x)
          this.rect.dx = Math.round(this.rect.dy * this.aspectRatio);
        else {
          this.rect.x = p.x + this.rect.dx - Math.round(this.rect.dy * this.aspectRatio);
          this.rect.dx = Math.round(this.rect.dy * this.aspectRatio);
        }
      }
      this.exitCreateRectangle();
      this.creatingRectangleFirstClick = false;
      this.creatingRectangle = false;
      this.dispatchEvent(new Event("newRectangle"));
    };
    redraw() {
      this.clearCtx();
      this.scale();
      this.rotate();
      this.gridDraw();
      this.rectanglesDraw();
    }
    toBlob(format = "image/jpeg", quality = 1) {
      const dataurl = this.canvas.toDataURL(format, quality);
      let arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }
    fromBlob(blob) {
      let urlCreator = window.URL || window.webkitURL;
      this.loadUrl(urlCreator.createObjectURL(blob));
    }
    getCoords(e) {
      var box = this.canvas.getBoundingClientRect();
      var body = document.body;
      var docEl = document.documentElement;
      var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
      var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
      var clientTop = docEl.clientTop || body.clientTop || 0;
      var clientLeft = docEl.clientLeft || body.clientLeft || 0;
      var top = box.top + scrollTop - clientTop;
      var left = box.left + scrollLeft - clientLeft;
      let zw = { top: Math.round(top), left: Math.round(left) };
      let x = e.pageX - zw.left;
      let y = e.pageY - zw.top;
      x = this.scaleW == -1 ? this.canvas.width - x : x;
      y = this.scaleH == -1 ? this.canvas.height - y : y;
      return { x, y };
    }
  };

  // src/js/helpers/utils.js
  var random = (min = 0, max = 1e6) => {
    return min + Math.floor(Math.random() * (max - min));
  };

  // src/js/components/reference.js
  var app2;
  var canvas = new Canvas(document.getElementById("PRcanvas"));
  var V2 = {
    showReferenceBtn: document.getElementById("showReferenceBtn"),
    saveReferenceBtn: document.getElementById("saveReferenceBtn"),
    doTakeBtn: document.getElementById("doTakeBtn"),
    ledNum: document.getElementById("MakeImage_LEDIntensity_value1"),
    brightnessNum: document.getElementById("MakeImage_Brightness_value1"),
    contrastNum: document.getElementById("MakeImage_Contrast_value1"),
    saturationNum: document.getElementById("MakeImage_Saturation_value1"),
    prerotateNum: document.getElementById("prerotateangle"),
    finerotateNum: document.getElementById("finerotate"),
    waitTimeNum: document.getElementById("MakeImage_WaitBeforeTakingPicture_value1"),
    imageQualityNum: document.getElementById("MakeImage_ImageQuality_value1"),
    imageSizeSlc: document.getElementById("MakeImage_ImageSize_value1"),
    fixedExposureChk: document.getElementById("MakeImage_FixedExposure_value1"),
    flipVerChk: document.getElementById("flipVer"),
    flipHorChk: document.getElementById("flipHor"),
    saveReboot: document.getElementById("saveReboot"),
    gridChk: document.getElementById("PRgrid"),
    pointerChk: document.getElementById("PRpointer")
  };
  var form = [
    V2.ledNum,
    V2.brightnessNum,
    V2.contrastNum,
    V2.saturationNum,
    V2.prerotateNum,
    V2.finerotateNum,
    V2.flipVerChk,
    V2.flipHorChk,
    V2.waitTimeNum,
    V2.imageSizeSlc,
    V2.imageQualityNum,
    V2.fixedExposureChk,
    V2.gridChk,
    V2.pointerChk
  ];
  function bindViewControls() {
    V2.showReferenceBtn.addEventListener("click", showReference);
    V2.doTakeBtn.addEventListener("click", doTake);
    V2.saveReferenceBtn.addEventListener("click", saveReference);
    V2.saveReboot.addEventListener("click", saveReboot);
    V2.gridChk.addEventListener("click", grid);
    V2.pointerChk.addEventListener("change", pointer);
    V2.prerotateNum.addEventListener("change", setDegrees);
    V2.finerotateNum.addEventListener("change", setDegrees);
    V2.flipVerChk.addEventListener("change", flipVer);
    V2.flipHorChk.addEventListener("change", flipHor);
  }
  async function doTake() {
    disableElements(form);
    let url = `/editflow.html?task=test_take`;
    url += "&host=" + app2.V.basepath;
    url += "&bri=" + V2.brightnessNum.value;
    url += "&con=" + V2.contrastNum.value;
    url += "&sat=" + V2.saturationNum.value;
    url += "&int=" + V2.ledNum.value;
    const res = await app2.get(url);
    if (!res.ok) {
      enableElements(form);
      return false;
    }
    canvas.reset();
    setDegrees();
    canvas.flipHor(V2.flipHorChk.checked);
    canvas.flipVer(V2.flipVerChk.checked);
    canvas.pointer(V2.pointerChk.checked);
    canvas.grid(V2.gridChk.checked);
    canvas.loadUrl(`${app2.V.basepath}/img_tmp/raw.jpg?session=${random()}`);
    enableElements(form);
    return true;
  }
  async function showReference() {
    const rotate = app2.P.Alignment.InitialRotate.value1;
    const prerotate = Math.trunc(rotate);
    const finerotate = +(Math.round(rotate % 1 + "e+2") + "e-2");
    V2.ledNum.value = app2.P.MakeImage.LEDIntensity.value1;
    V2.brightnessNum.value = app2.P.MakeImage.Brightness.value1;
    V2.contrastNum.value = app2.P.MakeImage.Contrast.value1;
    V2.saturationNum.value = app2.P.MakeImage.Saturation.value1;
    V2.finerotateNum.value = finerotate;
    V2.prerotateNum.value = prerotate;
    V2.waitTimeNum.value = app2.P.MakeImage.WaitBeforeTakingPicture.value1;
    V2.imageQualityNum.value = app2.P.MakeImage.ImageQuality.value1;
    V2.imageSizeSlc.value = app2.P.MakeImage.ImageSize.value1;
    V2.flipHorChk.checked = app2.P.MakeImage.FlipHor.value1 == "true";
    V2.flipVerChk.checked = app2.P.MakeImage.FlipVer.value1 == "true";
    V2.fixedExposureChk.checked = app2.P.MakeImage.FixedExposure.value1 == "true";
    canvas.reset();
    if (app2.blobReference != void 0) {
      canvas.fromBlob(app2.blobReference);
    } else {
      await app2.loadReferenceBlob();
    }
    disableElements(form);
  }
  async function saveReboot() {
    app2.P.MakeImage.WaitBeforeTakingPicture.checkEnable(true).setValue(1, V2.waitTimeNum.value);
    app2.P.MakeImage.ImageQuality.checkEnable(true).setValue(1, V2.imageQualityNum.value);
    app2.P.MakeImage.ImageSize.checkEnable(true).setValue(1, V2.imageSizeSlc.value);
    app2.P.MakeImage.FixedExposure.checkEnable(true).setValue(1, V2.fixedExposureChk.checked);
    const updated = await app2.updateDeviceConfig();
    if (!updated)
      return false;
    focusM2("Reboot");
  }
  async function saveReference() {
    if (confirm("Are you sure you want to update the reference image?")) {
      canvas.grid(false);
      canvas.pointer(false);
      canvas.redraw();
      app2.P.Alignment.InitialRotate.checkEnable(true).setValue(1, Number(V2.prerotateNum.value) + Number(V2.finerotateNum.value));
      app2.P.MakeImage.Brightness.checkEnable(true).setValue(1, V2.brightnessNum.value);
      app2.P.MakeImage.Contrast.checkEnable(true).setValue(1, V2.contrastNum.value);
      app2.P.MakeImage.Saturation.checkEnable(true).setValue(1, V2.saturationNum.value);
      app2.P.MakeImage.LEDIntensity.checkEnable(true).setValue(1, V2.ledNum.value);
      app2.P.MakeImage.WaitBeforeTakingPicture.checkEnable(true).setValue(1, V2.waitTimeNum.value);
      app2.P.MakeImage.ImageQuality.checkEnable(true).setValue(1, V2.imageQualityNum.value);
      app2.P.MakeImage.ImageSize.checkEnable(true).setValue(1, V2.imageSizeSlc.value);
      app2.P.MakeImage.FixedExposure.checkEnable(true).setValue(1, V2.fixedExposureChk.checked);
      app2.P.MakeImage.FlipHor.checkEnable(true).setValue(1, V2.flipHorChk.checked);
      app2.P.MakeImage.FlipVer.checkEnable(true).setValue(1, V2.flipVerChk.checked);
      const updated = await app2.updateDeviceConfig();
      if (!updated)
        return false;
      const file_path = "/config/reference.jpg";
      const blob = canvas.toBlob();
      const deleted = await app2.deleteFile(file_path);
      if (!deleted.ok) {
        console.log(`Error deleting old image reference.`);
      }
      const uploaded = await app2.uploadFile(file_path, blob);
      if (!uploaded.ok) {
        console.log(`Error uploading new image reference.`);
        return false;
      }
      showReference();
      alert("Reference is updated!");
      return true;
    }
  }
  function setDegrees() {
    let prerot = parseFloat(V2.prerotateNum.value);
    let finerot = parseFloat(V2.finerotateNum.value);
    if (finerot == 1 || finerot == -1) {
      prerot += finerot;
      finerot = 0;
    }
    V2.prerotateNum.value = prerot;
    V2.finerotateNum.value = finerot;
    canvas.setDegrees(prerot + finerot);
  }
  function flipHor() {
    canvas.flipHor(V2.flipHorChk.checked);
  }
  function flipVer() {
    canvas.flipVer(V2.flipVerChk.checked);
  }
  function grid() {
    canvas.grid(V2.gridChk.checked);
  }
  function pointer() {
    canvas.pointer(V2.pointerChk.checked);
  }
  function init2(_app) {
    app2 = _app;
    bindViewControls();
    app2.addEventListener("ReferenceUpdated", (e) => {
      canvas.fromBlob(app2.blobReference);
    });
    return true;
  }
  function load2() {
    app2.P.MakeImage.LEDIntensity.enabled = true;
    app2.P.MakeImage.Brightness.enabled = true;
    app2.P.MakeImage.Contrast.enabled = true;
    app2.P.MakeImage.Saturation.enabled = true;
    app2.P.Alignment.InitialRotate.enabled = true;
    app2.P.MakeImage.FlipVer.enabled = true;
    app2.P.MakeImage.FlipHor.enabled = true;
    app2.P.MakeImage.WaitBeforeTakingPicture.enabled = true;
    app2.P.MakeImage.ImageQuality.enabled = true;
    app2.P.MakeImage.ImageSize.enabled = true;
    app2.P.MakeImage.FixedExposure.enabled = true;
    if (!app2.P.MakeImage.LEDIntensity.found)
      app2.P.MakeImage.LEDIntensity.setValue(1, "0");
    if (!app2.P.MakeImage.Brightness.found)
      app2.P.MakeImage.Brightness.setValue(1, "0");
    if (!app2.P.MakeImage.Contrast.found)
      app2.P.MakeImage.Contrast.setValue(1, "0");
    if (!app2.P.MakeImage.Saturation.found)
      app2.P.MakeImage.Saturation.setValue(1, "0");
    if (!app2.P.Alignment.InitialRotate.found)
      app2.P.Alignment.InitialRotate.setValue(1, "0");
    if (!app2.P.MakeImage.FlipVer.found)
      app2.P.MakeImage.FlipVer.setValue(1, "false");
    if (!app2.P.MakeImage.FlipHor.found)
      app2.P.MakeImage.FlipHor.setValue(1, "false");
    if (!app2.P.MakeImage.WaitBeforeTakingPicture.found)
      app2.P.MakeImage.WaitBeforeTakingPicture.setValue(1, "5");
    if (!app2.P.MakeImage.ImageQuality.found)
      app2.P.MakeImage.ImageQuality.setValue(1, "10");
    if (!app2.P.MakeImage.ImageSize.found)
      app2.P.MakeImage.ImageSize.setValue(1, "VGA");
    if (!app2.P.MakeImage.FixedExposure.found)
      app2.P.MakeImage.FixedExposure.setValue(1, "false");
    return true;
  }
  function focus2() {
    showReference();
  }
  var reference_default = {
    init: init2,
    load: load2,
    focus: focus2
  };

  // src/js/components/alignment.js
  var app3;
  var canvas2 = new Canvas(document.getElementById("PAcanvas"));
  var V3 = {
    referenceSlc: document.getElementById("index"),
    enhanceContrastBtn: document.getElementById("enhancecontrast"),
    updateReferenceBtn: document.getElementById("updatereference"),
    saveRoiBtn: document.getElementById("PAsaveroi"),
    savereboot: document.getElementById("PAsavereboot"),
    nameTxt: document.getElementById("name"),
    referenceImg: document.getElementById("img_ref"),
    refOriginalImg: document.getElementById("img_ref_org"),
    x: document.getElementById("PArefx"),
    y: document.getElementById("PArefy"),
    dx: document.getElementById("PArefdx"),
    dy: document.getElementById("PArefdy"),
    gridChk: document.getElementById("PAgrid"),
    pointerChk: document.getElementById("PApointer"),
    SearchFieldXNum: document.getElementById("PA_SearchFieldX"),
    SearchFieldYNum: document.getElementById("PA_SearchFieldY"),
    AlignmentAlgoSlc: document.getElementById("PA_AlignmentAlgo")
  };
  function bindViewControls2() {
    V3.enhanceContrastBtn.addEventListener("click", EnhanceContrast);
    V3.updateReferenceBtn.addEventListener("click", CutOutReference);
    V3.saveRoiBtn.addEventListener("click", SaveToConfig);
    V3.savereboot.addEventListener("click", SaveAdvanced);
    V3.x.addEventListener("change", valuemanualchanged);
    V3.y.addEventListener("change", valuemanualchanged);
    V3.dx.addEventListener("change", valuemanualchanged);
    V3.dy.addEventListener("change", valuemanualchanged);
    V3.nameTxt.addEventListener("change", nameChanged);
    V3.referenceSlc.addEventListener("change", ChangeSelection);
    V3.gridChk.addEventListener("click", grid2);
    V3.pointerChk.addEventListener("change", pointer2);
    V3.referenceImg.addEventListener("load", function(e) {
      V3.dx.value = this.width;
      V3.dy.value = this.height;
      app3.R[refIndex]["dx"] = this.width;
      app3.R[refIndex]["dy"] = this.height;
      rect.dx = V3.dx.value;
      rect.dy = V3.dy.value;
      drawRec();
    });
  }
  var rect = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0
  };
  var refIndex = 0;
  var enhanceConDone = false;
  function ChangeSelection() {
    refIndex = parseInt(V3.referenceSlc.value);
    UpdateReference();
  }
  function nameChanged() {
    app3.R[refIndex].name = V3.nameTxt.value;
  }
  function valuemanualchanged() {
    rect.dx = V3.dx.value;
    rect.dy = V3.dy.value;
    rect.x = V3.x.value;
    rect.y = V3.y.value;
    drawRec();
  }
  async function CutOutReference() {
    app3.R[refIndex].x = V3.x.value;
    app3.R[refIndex].y = V3.y.value;
    app3.R[refIndex].dx = V3.dx.value;
    app3.R[refIndex].dy = V3.dy.value;
    await CallMakeRefZW();
    UpdateReference();
    V3.enhanceContrastBtn.disabled = false;
  }
  async function EnhanceContrast() {
    app3.R[refIndex]["name"] = V3.nameTxt.value;
    app3.R[refIndex]["x"] = V3.x.value;
    app3.R[refIndex]["y"] = V3.y.value;
    app3.R[refIndex]["dx"] = V3.dx.value;
    app3.R[refIndex]["dy"] = V3.dy.value;
    enhanceConDone = true;
    const enhanced = await MakeContrastImageZW(app3.R[refIndex], enhanceConDone);
    if (!enhanced) {
      console.log(`Error enhancing alignment mark.`);
      return false;
    }
    UpdateReference();
    return true;
  }
  async function SaveAdvanced() {
    app3.P.Alignment.SearchFieldX.setValue(1, V3.SearchFieldXNum.value);
    app3.P.Alignment.SearchFieldY.setValue(1, V3.SearchFieldYNum.value);
    app3.P.Alignment.AlignmentAlgo.setValue(1, V3.AlignmentAlgoSlc.value);
    const updated = await app3.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  async function SaveToConfig() {
    for (var index = 0; index < 2; ++index) {
      let to = app3.R[index]["name"];
      let from = to.replace("/config/", "/img_tmp/");
      await app3.deleteFile(to);
      await app3.copyFile(from, to);
      to = to.replace(".jpg", "_org.jpg");
      from = from.replace(".jpg", "_org.jpg");
      await app3.deleteFile(to);
      await app3.copyFile(from, to);
    }
    const updated = await app3.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function UpdateReference() {
    const path_tmp = app3.R[refIndex]["name"].replace("/config/", "/img_tmp/");
    const url_ref = new URL(`/fileserver${path_tmp}?${Date.now()}`, app3.V.basepath);
    console.log("Alignment UpdateReference url url_ref: ", url_ref.toString());
    V3.referenceImg.src = url_ref.toString();
    const path_org = app3.R[refIndex]["name"].replace("/config/", "/img_tmp/").replace(".jpg", "_org.jpg");
    const url_org = new URL(`/fileserver${path_org}?${Date.now()}`, app3.V.basepath);
    console.log("Alignment UpdateReference url_org: ", url_org.toString());
    V3.refOriginalImg.src = url_org.toString();
    V3.nameTxt.value = app3.R[refIndex]["name"];
    V3.x.value = app3.R[refIndex]["x"];
    V3.y.value = app3.R[refIndex]["y"];
    rect.x = app3.R[refIndex]["x"];
    rect.y = app3.R[refIndex]["y"];
    V3.enhanceContrastBtn.disabled = true;
    drawRec();
  }
  async function CallMakeRefZW() {
    let zw = app3.R[refIndex];
    const path2 = zw["name"].replace("/config/", "/img_tmp/").replace(".jpg", "_org.jpg");
    let url = "/editflow.html?task=cutref";
    url += "&in=/config/reference.jpg";
    url += "&out=" + path2;
    url += "&x=" + zw.x;
    url += "&y=" + zw.y;
    url += "&dx=" + zw.dx;
    url += "&dy=" + zw.dy;
    const res = await app3.get(url);
    const cuted = await app3.get(url);
    if (!cuted.ok)
      return false;
    const path22 = app3.R[refIndex]["name"].replace("/config/", "/img_tmp/");
    const copied = await app3.copyFile(path2, path22);
    if (!copied.ok)
      return false;
    return true;
  }
  async function MakeContrastImageZW(zw, enhanceContrast) {
    let url = "/editflow.html?task=cutref";
    url += "&in=/config/reference.jpg";
    url += "&out=" + zw["name"].replace("/config/", "/img_tmp/");
    url += "&x=" + zw.x;
    url += "&y=" + zw.y;
    url += "&dx=" + zw.dx;
    url += "&dy=" + zw.dy;
    if (enhanceContrast)
      url += "enhance=true";
    const res = await app3.get(url);
    const enhanced = await app3.get(url);
    return enhanced.ok;
  }
  function drawRec() {
    canvas2.clearRectangle();
    canvas2.addRectangle({
      x: parseInt(rect.x),
      y: parseInt(rect.y),
      dx: parseInt(rect.dx),
      dy: parseInt(rect.dy),
      template: "rectangle"
    });
  }
  function grid2() {
    canvas2.grid(V3.gridChk.checked);
  }
  function pointer2() {
    canvas2.pointer(V3.pointerChk.checked);
  }
  function init3(_app) {
    app3 = _app;
    canvas2.addEventListener("newRectangle", (e) => {
      rect = canvas2.rect;
      V3.dx.value = rect.dx;
      V3.dy.value = rect.dy;
      V3.x.value = rect.x;
      V3.y.value = rect.y;
      drawRec();
      canvas2.createRectangle();
    });
    app3.addEventListener("ReferenceUpdated", (e) => {
      canvas2.fromBlob(app3.blobReference);
    });
    bindViewControls2();
    canvas2.createRectangle();
    return true;
  }
  async function load3() {
    if (app3.blobReference != void 0) {
      canvas2.fromBlob(app3.blobReference);
    } else {
      await app3.loadReferenceBlob();
    }
    for (let i = 0; i < 2; ++i) {
      const enhanced = app3.R[i]["name"];
      const temp_enh = enhanced.replace("/config/", "/img_tmp/");
      await app3.deleteFile(temp_enh);
      const c1 = await app3.copyFile(enhanced, temp_enh);
      if (!c1.ok)
        return false;
      const original = enhanced.replace(".jpg", "_org.jpg");
      const temp_org = temp_enh.replace(".jpg", "_org.jpg");
      await app3.deleteFile(temp_org);
      const c2 = await app3.copyFile(original, temp_org);
      if (!c2.ok)
        return false;
    }
    V3.SearchFieldXNum.value = app3.P.Alignment.SearchFieldX.value1;
    V3.SearchFieldYNum.value = app3.P.Alignment.SearchFieldY.value1;
    V3.AlignmentAlgoSlc.value = app3.P.Alignment.AlignmentAlgo.value1;
    return true;
  }
  function focus3() {
    UpdateReference();
  }
  var alignment_default = {
    init: init3,
    load: load3,
    focus: focus3
  };

  // src/js/components/digits.js
  var app4;
  var canvas3 = new Canvas(document.getElementById("PDcanvas"));
  var V4 = {
    digitsEnableChk: document.getElementById("Category_Digits_enabled"),
    lockARChk: document.getElementById("PDlockAR"),
    newNumberBtn: document.getElementById("PDnewNumber"),
    numberSlc: document.getElementById("PDNumbers_value1"),
    renameNumberBtn: document.getElementById("PDrenameNumber"),
    removeNumberBtn: document.getElementById("PDremoveNumber"),
    newRoiBtn: document.getElementById("PDnewROI"),
    RoiSlc: document.getElementById("PDindex"),
    renameRoiBtn: document.getElementById("PDrenameROI"),
    deleteRoiBtn: document.getElementById("PDdeleteROI"),
    moveNextBtn: document.getElementById("PDmoveNext"),
    movePreviousBtn: document.getElementById("PDmovePrevious"),
    saveRoiBtn: document.getElementById("PDsaveroi"),
    x: document.getElementById("PDrefx"),
    y: document.getElementById("PDrefy"),
    dx: document.getElementById("PDrefdx"),
    dy: document.getElementById("PDrefdy"),
    gridChk: document.getElementById("PDgrid"),
    pointerChk: document.getElementById("PDpointer")
  };
  var numberGroup = [V4.newNumberBtn, V4.numberSlc, V4.renameNumberBtn, V4.removeNumberBtn];
  var roiGroup = [V4.lockARChk, V4.newRoiBtn, V4.RoiSlc, V4.renameRoiBtn, V4.deleteRoiBtn, V4.moveNextBtn, V4.movePreviousBtn, V4.saveRoiBtn, V4.x, V4.y, V4.dx, V4.dy];
  var editGroup = [...roiGroup, ...numberGroup];
  function bindViewControls3() {
    V4.digitsEnableChk.addEventListener("click", changeDigitsEnableChk);
    V4.lockARChk.addEventListener("click", changeLockARChk);
    V4.newNumberBtn.addEventListener("click", newNumber);
    V4.numberSlc.addEventListener("change", (e) => UpdateROIs());
    V4.renameNumberBtn.addEventListener("click", renameNumber);
    V4.removeNumberBtn.addEventListener("click", removeNumber);
    V4.newRoiBtn.addEventListener("click", newROI);
    V4.RoiSlc.addEventListener("change", ChangeSelection2);
    V4.renameRoiBtn.addEventListener("click", renameROI);
    V4.deleteRoiBtn.addEventListener("click", deleteROI);
    V4.moveNextBtn.addEventListener("click", moveNext);
    V4.movePreviousBtn.addEventListener("click", movePrevious);
    V4.x.addEventListener("change", valuemanualchanged2);
    V4.y.addEventListener("change", valuemanualchanged2);
    V4.dx.addEventListener("change", valuemanualchangeddx);
    V4.dy.addEventListener("change", valuemanualchanged2);
    V4.saveRoiBtn.addEventListener("click", SaveToConfig2);
    V4.gridChk.addEventListener("click", grid3);
    V4.pointerChk.addEventListener("change", pointer3);
  }
  var rect2 = { x: 0, y: 0, dx: 0, dy: 0 };
  var roiI = 0;
  var digits = [];
  function changeDigitsEnableChk() {
    if (V4.digitsEnableChk.checked) {
      enableElements(editGroup);
      canvas3.createRectangle("digit", V4.lockARChk.checked ? 0.5 : void 0);
      UpdateNUMBERS();
    } else {
      disableElements(editGroup);
      canvas3.exitCreateRectangle();
    }
  }
  function changeLockARChk() {
    canvas3.createRectangle("digit", V4.lockARChk.checked ? 0.5 : void 0);
  }
  function UpdateNUMBERS(numberName) {
    while (V4.numberSlc.length)
      V4.numberSlc.remove(0);
    app4.N.forEach((d, i) => {
      let option = document.createElement("option");
      option.text = d.name;
      option.value = i;
      V4.numberSlc.add(option);
    });
    V4.numberSlc.selectedIndex = 0;
    if (numberName !== void 0) {
      app4.N.forEach((d, i) => d.name == numberName ? V4.numberSlc.selectedIndex = i : null);
    }
    UpdateROIs();
  }
  function renameNumber() {
    const oldName = V4.numberSlc.options[V4.numberSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", oldName);
    const res = app4.RenameNUMBER(oldName, newName);
    if (res != void 0)
      return alert(res);
    UpdateNUMBERS(newName);
  }
  function newNumber() {
    let numberName = prompt("Please enter name of new number", "name");
    numberName = numberName.replace(/ /g, "");
    const res = app4.CreateNUMBER(numberName);
    if (res != void 0)
      return alert(res);
    UpdateNUMBERS(numberName);
  }
  function removeNumber() {
    if (confirm('This will remove the number complete (analog and digital).\nIf you only want to remove the digital ROIs, please use "Delete ROIs".\nDo you want to proceed?')) {
      const numberName = V4.numberSlc.options[V4.numberSlc.selectedIndex].text;
      const res = app4.DeleteNUMBER(numberName);
      if (res != void 0)
        return alert(res);
      UpdateNUMBERS();
    }
  }
  function deleteROI() {
    const numberName = V4.numberSlc.options[V4.numberSlc.selectedIndex].text;
    const roiName = V4.RoiSlc.options[V4.RoiSlc.selectedIndex].text;
    const res = app4.deleteROI(numberName, "digit", roiName);
    if (res?.length)
      return alert(res);
    UpdateROIs();
  }
  function newROI() {
    const numberName = V4.numberSlc.options[V4.numberSlc.selectedIndex].text;
    const roiName = prompt("Please enter name of new ROI", "name");
    const res = app4.CreateROI(
      numberName,
      "digit",
      roiName,
      1,
      1,
      digits.length ? digits[roiI].dx : 30,
      digits.length ? digits[roiI].dy : 51
    );
    if (res?.length)
      return alert(res);
    UpdateROIs(roiName);
  }
  function movePrevious() {
    [digits[roiI - 1], digits[roiI]] = [digits[roiI], digits[roiI - 1]];
    roiI--;
    UpdateROIs();
  }
  function moveNext() {
    [digits[roiI + 1], digits[roiI]] = [digits[roiI], digits[roiI + 1]];
    roiI++;
    UpdateROIs();
  }
  function ChangeSelection2() {
    roiI = parseInt(V4.RoiSlc.value);
    UpdateROIs();
  }
  async function SaveToConfig2() {
    app4.C.Digits.enabled = V4.digitsEnableChk.checked;
    const updated = await app4.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function renameROI() {
    const numberName = V4.numberSlc.options[V4.numberSlc.selectedIndex].text;
    const roiName = V4.RoiSlc.options[V4.RoiSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", roiName);
    const res = app4.RenameROI(numberName, "digit", roiName, newName);
    if (res?.length)
      return alert(res);
    UpdateROIs(newName);
  }
  function UpdateROIs(roiName) {
    digits = app4.N[V4.numberSlc.selectedIndex].digit;
    if (V4.digitsEnableChk.checked == false) {
      disableElements(editGroup);
      return;
    }
    if (!digits?.length) {
      disableElements(roiGroup);
      V4.newRoiBtn.disabled = false;
      V4.saveRoiBtn.disabled = false;
      return;
    }
    enableElements(roiGroup);
    while (V4.RoiSlc.length)
      V4.RoiSlc.remove(0);
    if (roiI > digits?.length)
      roiI = digits?.length;
    digits.forEach((d, i) => {
      let option = document.createElement("option");
      option.text = d.name;
      option.value = i;
      V4.RoiSlc.add(option);
    });
    if (roiName !== void 0) {
      digits.forEach((d, i) => d.name == roiName ? roiI = i : null);
    }
    V4.RoiSlc.selectedIndex = roiI;
    if (roiI == 0)
      V4.movePreviousBtn.disabled = true;
    if (roiI == digits.length - 1)
      V4.moveNextBtn.disabled = true;
    V4.x.value = rect2.x = digits[roiI].x;
    V4.y.value = rect2.y = digits[roiI].y;
    V4.dx.value = rect2.dx = digits[roiI].dx;
    V4.dy.value = rect2.dy = digits[roiI].dy;
    updateCanvasRoisView();
  }
  function updateCanvasRoisView() {
    if (!V4.digitsEnableChk.checked)
      return;
    if (!digits)
      return;
    canvas3.clearRectangle();
    digits.forEach((d, i) => canvas3.addRectangle({
      x: parseInt(d.x),
      y: parseInt(d.y),
      dx: parseInt(d.dx),
      dy: parseInt(d.dy),
      template: i == V4.RoiSlc.selectedIndex ? "digit" : "rectangle"
    }));
  }
  function valuemanualchanged2() {
    digits[roiI].dx = rect2.dx = V4.dx.value;
    digits[roiI].dy = rect2.dy = V4.dy.value;
    if (V4.lockARChk.checked) {
      digits[roiI].dx = V4.dx.value = rect2.dx = Math.round(rect2.dy * digits[roiI]["ar"]);
    }
    digits[roiI].x = rect2.x = V4.x.value;
    digits[roiI].y = rect2.y = V4.y.value;
    updateCanvasRoisView();
  }
  function valuemanualchangeddx() {
    digits[roiI].dx = rect2.dx = V4.dx.value;
    digits[roiI].dy = rect2.dy = V4.dy.value;
    if (V4.lockARChk.checked) {
      digits[roiI].dy = V4.dy.value = rect2.dy = Math.round(rect2.dx / digits[roiI]["ar"]);
    }
    digits[roiI].x = rect2.x = V4.x.value;
    digits[roiI].y = rect2.y = V4.y.value;
    updateCanvasRoisView();
  }
  function grid3() {
    canvas3.grid(V4.gridChk.checked);
  }
  function pointer3() {
    canvas3.pointer(V4.pointerChk.checked);
  }
  function init4(_app) {
    app4 = _app;
    V4.digitsEnableChk.checked = app4.C.Digits.enabled;
    V4.lockARChk.checked = true;
    canvas3.addEventListener("newRectangle", (e) => {
      rect2 = canvas3.rect;
      digits[roiI].x = V4.x.value = rect2.x;
      digits[roiI].y = V4.y.value = rect2.y;
      digits[roiI].dx = V4.dx.value = rect2.dx;
      digits[roiI].dy = V4.dy.value = rect2.dy;
      canvas3.createRectangle("digit", V4.lockARChk.checked ? 0.5 : void 0);
      updateCanvasRoisView();
    });
    app4.addEventListener("ReferenceUpdated", (e) => {
      canvas3.fromBlob(app4.blobReference);
    });
    bindViewControls3();
    canvas3.createRectangle("digit", V4.lockARChk.checked ? 0.5 : void 0);
    return true;
  }
  function focus4() {
    UpdateNUMBERS();
  }
  async function load4() {
    if (app4.blobReference != void 0) {
      canvas3.fromBlob(app4.blobReference);
    } else {
      await app4.loadReferenceBlob();
    }
    return true;
  }
  var digits_default = {
    init: init4,
    load: load4,
    focus: focus4
  };

  // src/js/components/analog.js
  var app5;
  var canvas4 = new Canvas(document.getElementById("PANcanvas"));
  var V5 = {
    analogEnableChk: document.getElementById("Category_Analog_enabled"),
    lockARChk: document.getElementById("PANlockAR"),
    newNumberBtn: document.getElementById("PANnewNumber"),
    numberSlc: document.getElementById("PANNumbers_value1"),
    renameNumberBtn: document.getElementById("PANrenameNumber"),
    removeNumberBtn: document.getElementById("PANremoveNumber"),
    newRoiBtn: document.getElementById("PANnewROI"),
    RoiSlc: document.getElementById("PANindex"),
    renameRoiBtn: document.getElementById("PANrenameROI"),
    deleteRoiBtn: document.getElementById("PANdeleteROI"),
    moveNextBtn: document.getElementById("PANmoveNext"),
    movePreviousBtn: document.getElementById("PANmovePrevious"),
    saveRoiBtn: document.getElementById("PANsaveroi"),
    x: document.getElementById("PANrefx"),
    y: document.getElementById("PANrefy"),
    dx: document.getElementById("PANrefdx"),
    dy: document.getElementById("PANrefdy"),
    gridChk: document.getElementById("PANgrid"),
    pointerChk: document.getElementById("PANpointer")
  };
  var numberGroup2 = [V5.newNumberBtn, V5.numberSlc, V5.renameNumberBtn, V5.removeNumberBtn];
  var roiGroup2 = [V5.lockARChk, V5.newRoiBtn, V5.RoiSlc, V5.renameRoiBtn, V5.deleteRoiBtn, V5.moveNextBtn, V5.movePreviousBtn, V5.saveRoiBtn, V5.x, V5.y, V5.dx, V5.dy];
  var editGroup2 = [...roiGroup2, ...numberGroup2];
  function bindViewControls4() {
    V5.analogEnableChk.addEventListener("click", changeAnalogEnableChk);
    V5.lockARChk.addEventListener("click", changeLockARChk2);
    V5.newNumberBtn.addEventListener("click", newNumber2);
    V5.numberSlc.addEventListener("change", (e) => UpdateROIs2());
    V5.renameNumberBtn.addEventListener("click", renameNumber2);
    V5.removeNumberBtn.addEventListener("click", removeNumber2);
    V5.newRoiBtn.addEventListener("click", newROI2);
    V5.RoiSlc.addEventListener("change", ChangeSelection3);
    V5.renameRoiBtn.addEventListener("click", renameROI2);
    V5.deleteRoiBtn.addEventListener("click", deleteROI2);
    V5.moveNextBtn.addEventListener("click", moveNext2);
    V5.movePreviousBtn.addEventListener("click", movePrevious2);
    V5.x.addEventListener("change", valuemanualchanged3);
    V5.y.addEventListener("change", valuemanualchanged3);
    V5.dx.addEventListener("change", valuemanualchangeddx2);
    V5.dy.addEventListener("change", valuemanualchanged3);
    V5.saveRoiBtn.addEventListener("click", SaveToConfig3);
    V5.gridChk.addEventListener("click", grid4);
    V5.pointerChk.addEventListener("change", pointer4);
  }
  var rect3 = { x: 0, y: 0, dx: 0, dy: 0 };
  var roiI2 = 0;
  var analogs = [];
  function changeAnalogEnableChk() {
    if (V5.analogEnableChk.checked) {
      enableElements(editGroup2);
      canvas4.createRectangle("analog", V5.lockARChk.checked ? 1 : void 0);
      UpdateNUMBERS2();
    } else {
      disableElements(editGroup2);
      canvas4.exitCreateRectangle();
    }
  }
  function changeLockARChk2() {
    canvas4.createRectangle("analog", V5.lockARChk.checked ? 1 : void 0);
  }
  function UpdateNUMBERS2(numberName) {
    while (V5.numberSlc.length)
      V5.numberSlc.remove(0);
    app5.N.forEach((d, i) => {
      let option = document.createElement("option");
      option.text = d.name;
      option.value = i;
      V5.numberSlc.add(option);
    });
    V5.numberSlc.selectedIndex = 0;
    if (numberName !== void 0) {
      app5.N.forEach((d, i) => d.name == numberName ? V5.numberSlc.selectedIndex = i : null);
    }
    UpdateROIs2();
  }
  function renameNumber2() {
    const oldName = V5.numberSlc.options[V5.numberSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", oldName);
    const res = app5.RenameNUMBER(oldName, newName);
    if (res != void 0)
      return alert(res);
    UpdateNUMBERS2(newName);
  }
  function newNumber2() {
    let numberName = prompt("Please enter name of new number", "name");
    numberName = numberName.replace(/ /g, "");
    const res = app5.CreateNUMBER(numberName);
    if (res != void 0)
      return alert(res);
    UpdateNUMBERS2(numberName);
  }
  function removeNumber2() {
    if (confirm('This will remove the number complete (analog and digital).\nIf you only want to remove the digital ROIs, please use "Delete ROIs".\nDo you want to proceed?')) {
      const numberName = V5.numberSlc.options[V5.numberSlc.selectedIndex].text;
      const res = app5.DeleteNUMBER(numberName);
      if (res != void 0)
        return alert(res);
      UpdateNUMBERS2();
    }
  }
  function deleteROI2() {
    const numberName = V5.numberSlc.options[V5.numberSlc.selectedIndex].text;
    const roiName = V5.RoiSlc.options[V5.RoiSlc.selectedIndex].text;
    const res = app5.deleteROI(numberName, "analog", roiName);
    if (res?.length)
      return alert(res);
    UpdateROIs2();
  }
  function newROI2() {
    const numberName = V5.numberSlc.options[V5.numberSlc.selectedIndex].text;
    const roiName = prompt("Please enter name of new ROI", "name");
    const res = app5.CreateROI(
      numberName,
      "analog",
      roiName,
      1,
      1,
      analogs.length ? analogs[roiI2].dx : 30,
      analogs.length ? analogs[roiI2].dy : 51
    );
    if (res?.length)
      return alert(res);
    UpdateROIs2(roiName);
  }
  function movePrevious2() {
    [analogs[roiI2 - 1], analogs[roiI2]] = [analogs[roiI2], analogs[roiI2 - 1]];
    roiI2--;
    UpdateROIs2();
  }
  function moveNext2() {
    [analogs[roiI2 + 1], analogs[roiI2]] = [analogs[roiI2], analogs[roiI2 + 1]];
    roiI2++;
    UpdateROIs2();
  }
  function ChangeSelection3() {
    roiI2 = parseInt(V5.RoiSlc.value);
    UpdateROIs2();
  }
  async function SaveToConfig3() {
    app5.C.Analog.enabled = V5.analogEnableChk.checked;
    await app5.updateDeviceConfig();
    alert("Config.ini is updated!");
  }
  function renameROI2() {
    const numberName = V5.numberSlc.options[V5.numberSlc.selectedIndex].text;
    const roiName = V5.RoiSlc.options[V5.RoiSlc.selectedIndex].text;
    const newName = prompt("Please enter new name", roiName);
    const res = app5.RenameROI(numberName, "analog", roiName, newName);
    if (res?.length)
      return alert(res);
    UpdateROIs2(newName);
  }
  function UpdateROIs2(roiName) {
    analogs = app5.N[V5.numberSlc.selectedIndex].analog;
    if (V5.analogEnableChk.checked == false) {
      disableElements(roiGroup2);
      return;
    }
    if (!analogs?.length) {
      disableElements(roiGroup2);
      V5.newRoiBtn.disabled = false;
      V5.saveRoiBtn.disabled = false;
      return;
    }
    enableElements(roiGroup2);
    while (V5.RoiSlc.length)
      V5.RoiSlc.remove(0);
    if (roiI2 > analogs?.length)
      roiI2 = analogs?.length;
    analogs.forEach((d, i) => {
      let option = document.createElement("option");
      option.text = d.name;
      option.value = i;
      V5.RoiSlc.add(option);
    });
    if (roiName !== void 0) {
      analogs.forEach((d, i) => d.name == roiName ? roiI2 = i : null);
    }
    V5.RoiSlc.selectedIndex = roiI2;
    if (roiI2 == 0)
      V5.movePreviousBtn.disabled = true;
    if (roiI2 == analogs.length - 1)
      V5.moveNextBtn.disabled = true;
    V5.x.value = rect3.x = analogs[roiI2].x;
    V5.y.value = rect3.y = analogs[roiI2].y;
    V5.dx.value = rect3.dx = analogs[roiI2].dx;
    V5.dy.value = rect3.dy = analogs[roiI2].dy;
    updateCanvasRoisView2();
  }
  function updateCanvasRoisView2() {
    if (!V5.analogEnableChk.checked)
      return;
    if (!analogs)
      return;
    canvas4.clearRectangle();
    analogs.forEach((d, i) => canvas4.addRectangle({
      x: parseInt(d.x),
      y: parseInt(d.y),
      dx: parseInt(d.dx),
      dy: parseInt(d.dy),
      template: i == V5.RoiSlc.selectedIndex ? "analog" : "rectangle"
    }));
  }
  function valuemanualchanged3() {
    analogs[roiI2].dx = rect3.dx = V5.dx.value;
    analogs[roiI2].dy = rect3.dy = V5.dy.value;
    if (V5.lockARChk.checked) {
      analogs[roiI2].dx = V5.dx.value = rect3.dx = Math.round(rect3.dy * analogs[roiI2]["ar"]);
    }
    analogs[roiI2].x = rect3.x = V5.x.value;
    analogs[roiI2].y = rect3.y = V5.y.value;
    updateCanvasRoisView2();
  }
  function valuemanualchangeddx2() {
    analogs[roiI2].dx = rect3.dx = V5.dx.value;
    analogs[roiI2].dy = rect3.dy = V5.dy.value;
    if (V5.lockARChk.checked) {
      analogs[roiI2].dy = V5.dy.value = rect3.dy = Math.round(rect3.dx / analogs[roiI2]["ar"]);
    }
    analogs[roiI2].x = rect3.x = V5.x.value;
    analogs[roiI2].y = rect3.y = V5.y.value;
    updateCanvasRoisView2();
  }
  function grid4() {
    canvas4.grid(V5.gridChk.checked);
  }
  function pointer4() {
    canvas4.pointer(V5.pointerChk.checked);
  }
  function init5(_app) {
    app5 = _app;
    V5.analogEnableChk.checked = app5.C.Analog.enabled;
    V5.lockARChk.checked = true;
    canvas4.addEventListener("newRectangle", (e) => {
      rect3 = canvas4.rect;
      analogs[roiI2].x = V5.x.value = rect3.x;
      analogs[roiI2].y = V5.y.value = rect3.y;
      analogs[roiI2].dx = V5.dx.value = rect3.dx;
      analogs[roiI2].dy = V5.dy.value = rect3.dy;
      canvas4.createRectangle("analog", V5.lockARChk.checked ? 1 : void 0);
      updateCanvasRoisView2();
    });
    app5.addEventListener("ReferenceUpdated", (e) => {
      canvas4.fromBlob(app5.blobReference);
    });
    bindViewControls4();
    canvas4.createRectangle("analog", V5.lockARChk.checked ? 1 : void 0);
    return true;
  }
  function focus5() {
    UpdateNUMBERS2();
  }
  async function load5() {
    if (app5.blobReference != void 0) {
      canvas4.fromBlob(app5.blobReference);
    } else {
      await app5.loadReferenceBlob();
    }
    return true;
  }
  var analog_default = {
    init: init5,
    load: load5,
    focus: focus5
  };

  // src/js/components/help.js
  var app6;
  var V6 = {
    starttime: document.getElementById("starttime"),
    Hostname: document.getElementById("Hostname"),
    IP: document.getElementById("IP"),
    SSID: document.getElementById("SSID"),
    GitBranch: document.getElementById("GitBranch"),
    GitBaseBranch: document.getElementById("GitBaseBranch"),
    GitVersion: document.getElementById("GitVersion"),
    BuildTime: document.getElementById("BuildTime"),
    HTMLVersion: document.getElementById("HTMLVersion"),
    leaveSetupBtn: document.getElementById("leaveSetup")
  };
  function bindViewControls5() {
    V6.leaveSetupBtn.addEventListener("click", (e) => leaveSetup());
  }
  function init6(_app) {
    app6 = _app;
    bindViewControls5();
    return true;
  }
  async function load6() {
    await app6.loadRunningValues();
    V6.Hostname.innerHTML = app6.V.Hostname;
    V6.starttime.innerHTML = app6.V.starttime;
    V6.IP.innerHTML = app6.V.IP;
    V6.SSID.innerHTML = app6.V.SSID;
    V6.GitBranch.innerHTML = app6.V.GitBranch;
    V6.GitBaseBranch.innerHTML = app6.V.GitBaseBranch;
    V6.BuildTime.innerHTML = app6.V.BuildTime;
    V6.HTMLVersion.innerHTML = app6.V.HTMLVersion;
    return true;
  }
  async function leaveSetup() {
    if (confirm("Do you want to leave the configuration mode and restart the ESP32?\n\nPlease reload the page in about 30s.")) {
      app6.P.System.SetupMode.checkEnable(true).setValue(1, false);
      await app6.updateDeviceConfig();
      var stringota = "/reboot";
      window.location = stringota;
      window.location.href = stringota;
      window.location.assign(stringota);
      window.location.replace(stringota);
    }
  }
  var help_default = {
    init: init6,
    load: load6,
    focus: void 0
  };

  // src/js/components/mqtt.js
  var app7;
  var V7 = {
    Uri: document.getElementById("PMQTT_Uri"),
    MainTopic: document.getElementById("PMQTT_MainTopic"),
    ClientID: document.getElementById("PMQTT_ClientID"),
    user: document.getElementById("PMQTT_user"),
    password: document.getElementById("PMQTT_password"),
    SetRetainFlag: document.getElementById("PMQTT_SetRetainFlag"),
    EnabledChk: document.getElementById("PMQTT_EnabledChk"),
    SaveBtn: document.getElementById("PMQTT_SaveBtn")
  };
  var editForm = [
    V7.Uri,
    V7.MainTopic,
    V7.ClientID,
    V7.user,
    V7.password,
    V7.SetRetainFlag
  ];
  function bindViewControls6() {
    V7.EnabledChk.addEventListener("change", setEnable);
    V7.SaveBtn.addEventListener("click", Save);
  }
  function setEnable() {
    if (V7.EnabledChk.checked)
      enableElements(editForm);
    else
      disableElements(editForm);
  }
  async function Save() {
    app7.C.MQTT.enabled = V7.EnabledChk.checked;
    if (app7.C.MQTT.enabled) {
      app7.P.MQTT.Uri.checkEnable(true).setValue(1, V7.Uri.value);
      app7.P.MQTT.MainTopic.checkEnable(true).setValue(1, V7.MainTopic.value);
      app7.P.MQTT.ClientID.checkEnable(true).setValue(1, V7.ClientID.value);
      app7.P.MQTT.user.checkEnable(true).setValue(1, V7.user.value);
      app7.P.MQTT.password.checkEnable(true).setValue(1, V7.password.value);
      app7.P.MQTT.SetRetainFlag.checkEnable(true).setValue(1, V7.SetRetainFlag.checked);
    }
    const updated = await app7.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function load7() {
    V7.EnabledChk.checked = app7.C.MQTT.enabled;
    V7.Uri.value = app7.P.MQTT.Uri.value1;
    V7.MainTopic.value = app7.P.MQTT.MainTopic.value1;
    V7.ClientID.value = app7.P.MQTT.ClientID.value1;
    V7.user.value = app7.P.MQTT.user.value1;
    V7.password.value = app7.P.MQTT.password.value1;
    V7.SetRetainFlag.checked = app7.P.MQTT.SetRetainFlag.value1;
    setEnable();
    return true;
  }
  function init7(_app) {
    app7 = _app;
    bindViewControls6();
    return true;
  }
  var mqtt_default = {
    init: init7,
    load: load7,
    focus: void 0
  };

  // src/js/components/influxdb.js
  var app8;
  var V8 = {
    Uri: document.getElementById("PIDB_Uri"),
    Database: document.getElementById("PIDB_Database"),
    Measurement: document.getElementById("PIDB_Measurement"),
    user: document.getElementById("PIDB_user"),
    password: document.getElementById("PIDB_password"),
    EnabledChk: document.getElementById("PIDB_EnabledChk"),
    SaveBtn: document.getElementById("PIDB_SaveBtn")
  };
  var editForm2 = [
    V8.Uri,
    V8.Database,
    V8.Measurement,
    V8.user,
    V8.password
  ];
  function bindViewControls7() {
    V8.EnabledChk.addEventListener("change", setEnable2);
    V8.SaveBtn.addEventListener("click", Save2);
  }
  function setEnable2() {
    if (V8.EnabledChk.checked)
      enableElements(editForm2);
    else
      disableElements(editForm2);
  }
  async function Save2() {
    app8.C.InfluxDB.enabled = V8.EnabledChk.checked;
    if (app8.C.InfluxDB.enabled) {
      app8.P.InfluxDB.Uri.checkEnable(true).setValue(1, V8.Uri.value);
      app8.P.InfluxDB.Database.checkEnable(true).setValue(1, V8.Database.value);
      app8.P.InfluxDB.Measurement.checkEnable(true).setValue(1, V8.Measurement.value);
      app8.P.InfluxDB.user.checkEnable(true).setValue(1, V8.user.value);
      app8.P.InfluxDB.password.checkEnable(true).setValue(1, V8.password.value);
    }
    const updated = await app8.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function load8() {
    V8.EnabledChk.checked = app8.C.InfluxDB.enabled;
    V8.Uri.value = app8.P.InfluxDB.Uri.value1;
    V8.Database.value = app8.P.InfluxDB.Database.value1;
    V8.Measurement.value = app8.P.InfluxDB.Measurement.value1;
    V8.user.value = app8.P.InfluxDB.user.value1;
    V8.password.value = app8.P.InfluxDB.password.value1;
    setEnable2();
    return true;
  }
  function init8(_app) {
    app8 = _app;
    bindViewControls7();
    return true;
  }
  var influxdb_default = {
    init: init8,
    load: load8,
    focus: void 0
  };

  // src/js/components/fileserver.js
  var app9;
  var MAX_FILE_SIZE = 2e3 * 1024;
  var getprefix = "/fileserver";
  var uploadprefix = "/upload";
  var root_path = "/";
  var path = "/";
  var items = [];
  var V9 = {
    newfileBtn: document.getElementById("newfile"),
    filepath: document.getElementById("filepath"),
    uploadBtn: document.getElementById("upload"),
    filesTable: document.getElementById("filesTable"),
    navBar: document.getElementById("FS_navBar")
  };
  var menuGroup = [V9.newfileBtn, V9.filepath, V9.uploadBtn];
  function bindViewControls8() {
    V9.uploadBtn.addEventListener("click", (e) => upload());
    V9.newfileBtn.addEventListener("change", (e) => V9.filepath.value = path + V9.newfileBtn.files[0].name);
  }
  function clearNav() {
    while (V9.navBar.firstChild) {
      V9.navBar.removeChild(V9.navBar.firstChild);
    }
  }
  function loadNav(path2) {
    let folders = path2.split("/");
    for (let i = 0; i < folders.length - 1; i++) {
      const folderName = i != 0 ? "/" + folders[i] : "/";
      const folderPath = folders.slice(0, i + 1).join("/") + "/";
      let li = document.createElement("li");
      li.addEventListener("click", (e) => {
        goPath(folderPath);
      });
      li.appendChild(document.createTextNode(folderName));
      V9.navBar.appendChild(li);
    }
  }
  function init9(_app) {
    app9 = _app;
    bindViewControls8();
    return true;
  }
  async function load9() {
    goPath(root_path);
    return true;
  }
  async function goPath(new_path) {
    clearTable();
    clearNav();
    path = new_path;
    const str_json = await app9.getFile(path);
    if (!str_json.ok)
      return console.log("Cant get fileserver path data.");
    items = JSON.parse(str_json.text).sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i < items.length; i++) {
      insertRow(items[i]);
    }
    loadNav(path);
  }
  function clearTable() {
    let items2 = V9.filesTable.rows.length;
    for (let i = 0; i < items2; i++) {
      V9.filesTable.deleteRow(0);
    }
  }
  function insertRow(item, index = void 0) {
    if (!index)
      index = V9.filesTable.rows.length;
    console.log("Insert row index: ", index);
    let tr = V9.filesTable.insertRow(index);
    let nameTd = tr.insertCell();
    nameTd.innerHTML = item.name;
    nameTd.addEventListener("click", (e) => {
      if (item.type == "directory")
        goPath(`${path}${item.name}/`);
      if (item.type == "file")
        window.open(`${app9.V.basepath}${getprefix}${path}${item.name}`, "_blank").focus();
    });
    let typeTd = tr.insertCell();
    typeTd.innerHTML = item["type"];
    let sizeTd = tr.insertCell();
    sizeTd.innerHTML = item["syze"];
    let readonlyTd = tr.insertCell();
    readonlyTd.innerHTML = item["readonly"];
    let deleteTd = tr.insertCell();
    deleteTd.innerHTML = "Delete";
    deleteTd.addEventListener("click", async (e) => {
      const deleted = await app9.deleteFile(`${path}${item.name}`);
      if (!deleted.ok) {
        console.log("Cant delete file.");
        return;
      }
      goPath(path);
    });
  }
  async function upload() {
    if (V9.newfileBtn.files.length == 0) {
      alert("No file selected!");
    } else if (V9.filepath.value.length == 0) {
      alert("File path on server is not set!");
    } else if (V9.filepath.value.indexOf(" ") >= 0) {
      alert("File path on server cannot have spaces!");
    } else if (V9.filepath.value[V9.filepath.value.length - 1] == "/") {
      alert("File name not specified after path!");
    } else if (V9.newfileBtn.files[0].size > MAX_FILE_SIZE) {
      alert("File size must be less than 2000KB!");
    } else {
      disableElements(menuGroup);
      const posted = await app9.post(uploadprefix + V9.filepath.value, V9.newfileBtn.files[0]);
      if (!posted) {
        enableElements(menuGroup);
        return false;
      }
      insertRow({
        name: V9.filepath.value.split("/").pop(),
        type: "file",
        syze: V9.newfileBtn.files[0].size,
        readonly: false
      });
      enableElements(menuGroup);
      return true;
    }
  }
  var fileserver_default = {
    init: init9,
    load: load9,
    focus: void 0
  };

  // src/js/components/schedule.js
  var app10;
  var V10 = {
    AutoStart: document.getElementById("PCFG_AutoStart"),
    Interval: document.getElementById("PCFG_Interval"),
    RawLogEnabled: document.getElementById("PCFG_RawLogEnabledChk"),
    RawStorePath: document.getElementById("PCFG_RawLogImageLocation"),
    RawStoreRetention: document.getElementById("PCFG_RawLogfileRetentionInDays"),
    DigitLogEnabled: document.getElementById("PCFG_DigitLogEnabledChk"),
    DigitStorePath: document.getElementById("PCFG_DigitLogImageLocation"),
    DigitStoreRetention: document.getElementById("PCFG_DigitLogfileRetentionInDays"),
    AnalogLogEnabled: document.getElementById("PCFG_AnalogLogEnabledChk"),
    AnalogStorePath: document.getElementById("PCFG_AnalogLogImageLocation"),
    AnalogStoreRetention: document.getElementById("PCFG_AnalogLogfileRetentionInDays"),
    SaveBtn: document.getElementById("PCFG_SaveBtn")
  };
  var deviceRun = [
    V10.AutoStart,
    V10.Interval
  ];
  var rawForm = [
    V10.RawStorePath,
    V10.RawStoreRetention
  ];
  var digitForm = [
    V10.DigitStorePath,
    V10.DigitStoreRetention
  ];
  var analogForm = [
    V10.AnalogStorePath,
    V10.AnalogStoreRetention
  ];
  function bindViewControls9() {
    V10.RawLogEnabled.addEventListener("change", setEnable3);
    V10.DigitLogEnabled.addEventListener("change", setEnable3);
    V10.AnalogLogEnabled.addEventListener("change", setEnable3);
    V10.SaveBtn.addEventListener("click", Save3);
  }
  function setEnable3() {
    if (V10.RawLogEnabled.checked)
      enableElements(rawForm);
    else
      disableElements(rawForm);
    if (V10.DigitLogEnabled.checked)
      enableElements(digitForm);
    else
      disableElements(digitForm);
    if (V10.AnalogLogEnabled.checked)
      enableElements(analogForm);
    else
      disableElements(analogForm);
  }
  async function Save3() {
    app10.P.AutoTimer.AutoStart.checkEnable(true).setValue(1, V10.AutoStart.value);
    app10.P.AutoTimer.Intervall.checkEnable(true).setValue(1, V10.Interval.value);
    const rawOn = V10.RawLogEnabled.checked;
    app10.P.MakeImage.LogImageLocation.checkEnable(rawOn).setValue(1, V10.RawStorePath.value);
    app10.P.MakeImage.LogfileRetentionInDays.checkEnable(rawOn).setValue(1, V10.RawStoreRetention.value);
    const digOn = V10.DigitLogEnabled.checked;
    app10.P.Digits.LogImageLocation.checkEnable(digOn).setValue(1, V10.DigitStorePath.value);
    app10.P.Digits.LogfileRetentionInDays.checkEnable(digOn).setValue(1, V10.RawStoreRetention.value);
    const anaOn = V10.AnalogLogEnabled.checked;
    app10.P.Analog.LogImageLocation.checkEnable(anaOn).setValue(1, V10.AnalogStorePath.value);
    app10.P.Analog.LogfileRetentionInDays.checkEnable(anaOn).setValue(1, V10.AnalogStoreRetention.value);
    const updated = await app10.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function load10() {
    V10.RawLogEnabled.checked = app10.P.MakeImage.LogfileRetentionInDays.enabled;
    V10.DigitLogEnabled.checked = app10.P.Digits.LogfileRetentionInDays.enabled;
    V10.AnalogLogEnabled.checked = app10.P.Analog.LogfileRetentionInDays.enabled;
    V10.AutoStart.value = app10.P.AutoTimer.AutoStart.value1;
    V10.Interval.value = app10.P.AutoTimer.Intervall.value1;
    V10.RawStorePath.value = app10.P.MakeImage.LogImageLocation.value1;
    V10.RawStoreRetention.value = app10.P.MakeImage.LogfileRetentionInDays.value1;
    V10.DigitStorePath.value = app10.P.Digits.LogImageLocation.value1;
    V10.DigitStoreRetention.value = app10.P.Digits.LogfileRetentionInDays.value1;
    V10.AnalogStorePath.value = app10.P.Analog.LogImageLocation.value1;
    V10.AnalogStoreRetention.value = app10.P.Analog.LogfileRetentionInDays.value1;
    setEnable3();
    return true;
  }
  function init10(_app) {
    app10 = _app;
    bindViewControls9();
    return true;
  }
  var schedule_default = {
    init: init10,
    load: load10,
    focus: void 0
  };

  // src/js/components/cnn.js
  var app11;
  var V11 = {
    DigitEnabledChk: document.getElementById("PCNN_DigitEnabledChk"),
    DigitModel: document.getElementById("PCNN_DigitModel"),
    CNNGoodThreshold: document.getElementById("PCNN_CNNGoodThreshold"),
    AnalogEnabledChk: document.getElementById("PCNN_AnalogEnabledChk"),
    AnalogModel: document.getElementById("PCNN_AnalogModel"),
    SaveBtn: document.getElementById("PCNN_SaveBtn")
  };
  var digitForm2 = [
    V11.DigitModel,
    V11.CNNGoodThreshold
  ];
  var analogForm2 = [
    V11.AnalogModel
  ];
  function bindViewControls10() {
    V11.DigitEnabledChk.addEventListener("change", setEnable4);
    V11.AnalogEnabledChk.addEventListener("change", setEnable4);
    V11.SaveBtn.addEventListener("click", Save4);
  }
  function setEnable4() {
    if (V11.DigitEnabledChk.checked)
      enableElements(digitForm2);
    else
      disableElements(digitForm2);
    if (V11.AnalogEnabledChk.checked)
      enableElements(analogForm2);
    else
      disableElements(analogForm2);
  }
  async function Save4() {
    app11.C.Digits.enabled = V11.DigitEnabledChk.checked;
    if (app11.C.Digits.enabled) {
      app11.P.Digits.Model.checkEnable(true).setValue(1, V11.DigitModel.value);
      app11.P.Digits.CNNGoodThreshold.checkEnable(true).setValue(1, V11.CNNGoodThreshold.checked);
    }
    app11.C.Analog.enabled = V11.AnalogEnabledChk.checked;
    if (app11.C.Analog.enabled) {
      app11.P.Analog.Model.checkEnable(true).setValue(1, V11.AnalogModel.value);
    }
    const updated = await app11.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function load11() {
    V11.DigitEnabledChk.checked = app11.C.Digits.enabled;
    V11.AnalogEnabledChk.checked = app11.C.Analog.enabled;
    V11.DigitModel.value = app11.P.Digits.Model.value1;
    V11.CNNGoodThreshold.checked = app11.P.Digits.CNNGoodThreshold.value1;
    V11.AnalogModel.value = app11.P.Analog.Model.value1;
    setEnable4();
    return true;
  }
  function init11(_app) {
    app11 = _app;
    bindViewControls10();
    return true;
  }
  var cnn_default = {
    init: init11,
    load: load11,
    focus: void 0
  };

  // src/js/components/postprocessing.js
  var app12;
  var V12 = {
    EnabledChk: document.getElementById("PCPPSS_EnabledChk"),
    PreValueUse: document.getElementById("PCPPSS_PreValueUse"),
    PreValueAgeStartup: document.getElementById("PCPPSS_PreValueAgeStartup"),
    AllowNegativeRates: document.getElementById("PCPPSS_AllowNegativeRates"),
    ErrorMessage: document.getElementById("PCPPSS_ErrorMessage"),
    SaveBtn: document.getElementById("PCPPSS_SaveBtn")
  };
  var editForm3 = [
    V12.PreValueUse,
    V12.PreValueAgeStartup,
    V12.AllowNegativeRates,
    V12.ErrorMessage
  ];
  function bindViewControls11() {
    V12.EnabledChk.addEventListener("change", setEnable5);
    V12.SaveBtn.addEventListener("click", Save5);
  }
  function setEnable5() {
    if (V12.EnabledChk.checked)
      enableElements(editForm3);
    else
      disableElements(editForm3);
  }
  async function Save5() {
    app12.C.PostProcessing.enabled = V12.EnabledChk.checked;
    if (app12.C.PostProcessing.enabled) {
      app12.P.PostProcessing.PreValueUse.checkEnable(true).setValue(1, V12.PreValueUse.checked);
      app12.P.PostProcessing.PreValueAgeStartup.checkEnable(true).setValue(1, V12.PreValueAgeStartup.value);
      app12.P.PostProcessing.AllowNegativeRates.checkEnable(true).setValue(1, V12.AllowNegativeRates.checked);
      app12.P.PostProcessing.ErrorMessage.checkEnable(true).setValue(1, V12.ErrorMessage.checked);
    }
    const updated = await app12.updateDeviceConfig();
    if (!updated)
      return false;
    alert("Config.ini is updated!");
  }
  function load12() {
    V12.EnabledChk.checked = app12.C.PostProcessing.enabled;
    V12.PreValueUse.checked = app12.P.PostProcessing.PreValueUse.value1;
    V12.PreValueAgeStartup.value = app12.P.PostProcessing.PreValueAgeStartup.value1;
    V12.AllowNegativeRates.checked = app12.P.PostProcessing.AllowNegativeRates.value1;
    V12.ErrorMessage.checked = app12.P.PostProcessing.ErrorMessage.value1;
    setEnable5();
    return true;
  }
  function init12(_app) {
    app12 = _app;
    bindViewControls11();
    return true;
  }
  var postprocessing_default = {
    init: init12,
    load: load12,
    focus: void 0
  };

  // src/js/components/reboot.js
  var app13;
  var counterValue = 0;
  var V13 = {
    title: document.getElementById("PRBO_title"),
    counter: document.getElementById("PRBO_counter"),
    cancel: document.getElementById("PRBO_cancelreboot"),
    reboot: document.getElementById("PRBO_fastreboot"),
    spinner: document.getElementById("PRBO_spinner")
  };
  var initForm = [V13.counter, V13.reboot, V13.cancel];
  function bindViewControls12() {
    V13.reboot.addEventListener("click", (e) => {
      counterValue = -1;
      reboot();
    });
    V13.cancel.addEventListener("click", (e) => {
      counterValue = -1;
      hideElements(initForm);
      V13.title.innerHTML = "Stopped!";
    });
  }
  var initTimedReboot = async () => {
    if (counterValue === 0)
      return reboot();
    if (counterValue < 0)
      return;
    V13.title.innerHTML = "Are u sure?";
    V13.counter.innerHTML = counterValue;
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    counterValue--;
    return await initTimedReboot();
  };
  var reboot = async () => {
    console.log("reboot");
    V13.title.innerHTML = "Wait until reboot...";
    hideElements(initForm);
    showElements([V13.spinner]);
    const rebooted = await app13.get("/reboot");
    if (!rebooted.ok) {
      alert("Error calling device reboot.");
      return false;
    }
    await timedStatusReboot();
    hideElements([V13.spinner]);
    V13.title.innerHTML = "Reloading app...";
    await app13.reboot();
    V13.title.innerHTML = "Device rebooted!";
  };
  var timedStatusReboot = async () => {
    console.log("timedStatusReboot");
    let notYet = true;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      try {
        let request = await fetch(app13.V.basepath + "/statusflow.html", { signal: AbortSignal.timeout(1e3) });
        if (request.ok) {
          notYet = false;
          return true;
        }
      } catch (error) {
        console.log("Not rebooted yet.");
      }
    } while (notYet);
    return true;
  };
  function init13(_app) {
    hideElements([V13.spinner]);
    app13 = _app;
    bindViewControls12();
    return true;
  }
  async function focus6() {
    showElements(initForm);
    counterValue = 5;
    initTimedReboot();
    return true;
  }
  var reboot_default = {
    init: init13,
    load: void 0,
    focus: focus6
  };

  // src/js/components/config.js
  var app14;
  var V14 = {
    text: document.getElementById("PCFG_text"),
    reboot: document.getElementById("PCFG_reboot"),
    save: document.getElementById("PCFG_save")
  };
  function bindViewControls13() {
    V14.save.addEventListener("click", (e) => save());
    V14.reboot.addEventListener("click", (e) => focusM2("Reboot"));
  }
  async function save() {
    if (confirm('Are you sure you want to update "config.ini"?')) {
      const deleted = await app14.deleteFile("/config/config.ini");
      if (!deleted.ok)
        console.log("Error deleting config.ini file.");
      const saved = await app14.uploadFile("/config/config.ini", V14.text.value);
      saved.ok ? alert("Config.ini is updated!") : console.log("Error uploading new config.ini file.");
    }
  }
  function load13() {
    V14.text.value = app14.CFG_STR;
    V14.text.rows = app14.CFG_LINES.length + 3;
    V14.text.cols = app14.CFG_LINES.reduce((p, line) => line.length > p ? line.length : p, 0) + 3;
    return true;
  }
  function init14(_app) {
    app14 = _app;
    bindViewControls13();
    return true;
  }
  var config_default = {
    init: init14,
    load: load13,
    focus: void 0
  };

  // src/js/components/OTA.js
  var app15;
  var V15 = {
    status: document.getElementById("status"),
    doUpdate: document.getElementById("doUpdate"),
    newfile: document.getElementById("newfile"),
    progress: document.getElementById("progress")
  };
  function bindViewControls14() {
    V15.newfile.addEventListener("click", (e) => setpath());
    V15.doUpdate.addEventListener("click", (e) => prepareOnServer());
  }
  function setpath() {
    V15.doUpdate.disabled = false;
    V15.status.innerText = "Status: File selected";
  }
  async function prepareOnServer() {
    const fileName = V15.newfile.value.split(/[\\\/]/).pop();
    if (V15.newfile.files.length == 0) {
      alert("No file selected!");
      return;
    } else if (fileName.length == 0) {
      alert("File path on server is not set!");
      return;
    } else if (fileName.length > 100) {
      alert("Filename is to long! Max 100 characters.");
      return;
    } else if (fileName.indexOf(" ") >= 0) {
      alert("File path on server cannot have spaces!");
      return;
    } else if (V15.newfile.files[0].size > app15.MAX_FILE_SIZE) {
      alert("File size must be less than " + app15.MAX_FILE_SIZE_STR + "!");
      return;
    }
    V15.status.innerText = "Status: Preparations on ESP32";
    V15.doUpdate.disabled = true;
    timerOn("Server preparations...");
    const url = "/ota?delete=" + fileName;
    const res = await app15.get(url);
    timerOff();
    if (!res.ok) {
      V15.doUpdate.disabled = false;
      return alert("Prepare on server went wrong!");
    }
    upload2();
  }
  async function upload2() {
    V15.newfile.disabled = true;
    timerOn("Upload");
    V15.status.innerText = "Status: Uploading (takes up to 60s)...";
    const url = "/firmware/" + filePath;
    const uploaded = await app15.uloadFile(url, V15.newfile.files[0]);
    timerOff();
    if (!uploaded.ok) {
      V15.doUpdate.disabled = false;
      return alert("Upload went wrong!");
    }
    extract();
  }
  async function extract() {
    V15.status.innerText = "Status: Processing on ESP32 (takes up to 3 minutes)...";
    timerOn("Extraction");
    const url = "/ota?task=update&file=" + V15.newfile.value.split(/[\\\/]/).pop();
    const res = await app15.get(url);
    timerOff();
    if (!res.ok)
      return alert("OTA task update went wrong!");
    V15.status.innerText = "Status: Update completed!";
    V15.doUpdate.disabled = true;
    V15.newfile.disabled = false;
    if (res.text.startsWith("reboot"))
      focusM("Reboot");
    else
      alert("Processing done!\n\n" + res.text);
  }
  var timer;
  var count;
  function timerOn(step) {
    V15.progress.innerHTML = "(0s)";
    count = 0;
    timer = setInterval(() => {
      count++;
      V15.progress.innerHTML = `(${count}s)`;
    }, 1e3);
  }
  function timerOff() {
    clearInterval(timer);
    V15.progress.innerHTML = "";
  }
  function init15(_app) {
    app15 = _app;
    bindViewControls14();
    V15.doUpdate.disabled = true;
    return true;
  }
  var OTA_default = {
    init: init15,
    load: void 0,
    focus: void 0
  };

  // src/js/index.js
  var MODULES = {
    Home: home_default,
    Reference: reference_default,
    Alignment: alignment_default,
    Digits: digits_default,
    Analogs: analog_default,
    Help: help_default,
    MQTT: mqtt_default,
    InfluxDB: influxdb_default,
    FileServer: fileserver_default,
    Schedule: schedule_default,
    CNN: cnn_default,
    Postprocessing: postprocessing_default,
    Reboot: reboot_default,
    Config: config_default,
    OTA: OTA_default,
    Iframe: {
      init: void 0,
      load: void 0,
      focus: void 0
    }
  };
  var app16 = new APP();
  var V16 = {
    iframe: document.getElementById("iframe"),
    Spinner: document.getElementById("panelSpinner"),
    Home: document.getElementById("panelHome"),
    Reference: document.getElementById("panelReference"),
    Alignment: document.getElementById("panelAlignment"),
    Digits: document.getElementById("panelDigits"),
    Analogs: document.getElementById("panelAnalogs"),
    Iframe: document.getElementById("panelIframe"),
    Help: document.getElementById("panelHelp"),
    MQTT: document.getElementById("panelMQTT"),
    InfluxDB: document.getElementById("panelInfluxDB"),
    FileServer: document.getElementById("panelFileServer"),
    Schedule: document.getElementById("panelSchedule"),
    CNN: document.getElementById("panelCNN"),
    Postprocessing: document.getElementById("panelPostprocessing"),
    Reboot: document.getElementById("panelReboot"),
    Config: document.getElementById("panelConfig"),
    OTA: document.getElementById("panelOTA"),
    panelHomeBtn: document.getElementById("panelHomeBtn"),
    panelReferenceBtn: document.getElementById("panelReferenceBtn"),
    panelAlignmentBtn: document.getElementById("panelAlignmentBtn"),
    panelDigitsBtn: document.getElementById("panelDigitsBtn"),
    panelAnalogsBtn: document.getElementById("panelAnalogsBtn"),
    panelMQTTBtn: document.getElementById("panelMQTTBtn"),
    panelInfluxDBBtn: document.getElementById("panelInfluxDBBtn"),
    panelFileServerBtn: document.getElementById("panelFileServerBtn"),
    scheduleBtn: document.getElementById("scheduleBtn"),
    panelCNNBtn: document.getElementById("panelCNNBtn"),
    panelPostprocessingBtn: document.getElementById("panelPostprocessingBtn"),
    panelConfigBtn: document.getElementById("panelConfigBtn"),
    panelOTABtn: document.getElementById("panelOTABtn"),
    statusFlowNavBar: document.getElementById("statusFlowNavBar"),
    helpBtn: document.getElementById("help"),
    rebootBtn: document.getElementById("reboot")
  };
  var allPanels = [
    V16.OTA,
    V16.Config,
    V16.Reboot,
    V16.Postprocessing,
    V16.CNN,
    V16.Schedule,
    V16.FileServer,
    V16.InfluxDB,
    V16.MQTT,
    V16.Help,
    V16.Spinner,
    V16.Home,
    V16.Alignment,
    V16.Reference,
    V16.Digits,
    V16.Analogs,
    V16.Iframe
  ];
  function bindViewControls15() {
    V16.panelHomeBtn.addEventListener("click", (e) => focusM2("Home"));
    V16.panelReferenceBtn.addEventListener("click", (e) => focusM2("Reference"));
    V16.panelAlignmentBtn.addEventListener("click", (e) => focusM2("Alignment"));
    V16.panelDigitsBtn.addEventListener("click", (e) => focusM2("Digits"));
    V16.panelAnalogsBtn.addEventListener("click", (e) => focusM2("Analogs"));
    V16.panelMQTTBtn.addEventListener("click", (e) => focusM2("MQTT"));
    V16.panelInfluxDBBtn.addEventListener("click", (e) => focusM2("InfluxDB"));
    V16.panelFileServerBtn.addEventListener("click", (e) => focusM2("FileServer"));
    V16.scheduleBtn.addEventListener("click", (e) => focusM2("Schedule"));
    V16.panelCNNBtn.addEventListener("click", (e) => focusM2("CNN"));
    V16.panelPostprocessingBtn.addEventListener("click", (e) => focusM2("Postprocessing"));
    V16.panelConfigBtn.addEventListener("click", (e) => focusM2("Config"));
    V16.panelOTABtn.addEventListener("click", (e) => focusM2("OTA"));
    V16.helpBtn.addEventListener("click", (e) => focusM2("Help"));
    V16.rebootBtn.addEventListener("click", (e) => focusM2("Reboot"));
  }
  function initM(name) {
    if (MODULES[name].init == void 0)
      return true;
    if (MODULES[name].init(app16)) {
      MODULES[name].init = void 0;
      console.log("Init module ", name);
    }
    return !MODULES[name].init;
  }
  async function loadM(name) {
    if (!initM(name))
      return false;
    if (MODULES[name].load == void 0)
      return true;
    let loaded = await MODULES[name].load(app16);
    if (!loaded)
      return false;
    MODULES[name].load = void 0;
    console.log("Load module ", name);
    return true;
  }
  async function focusM2(name) {
    hideElements(allPanels);
    showElements([V16.Spinner]);
    if (!await loadM(name)) {
      return false;
    }
    if (MODULES[name].focus)
      MODULES[name].focus(app16);
    console.log("Focus module ", name);
    hideElements([V16.Spinner]);
    showElements([V16[name]]);
    return true;
  }
  function goIframe(url) {
    focusM2("Iframe");
    V16.iframe.src = url;
  }
  async function init16() {
    hideElements(allPanels);
    bindViewControls15();
    const init17 = await app16.init();
    if (!init17) {
      console.log("ERROR: App init fail.");
      return;
    }
    console.log("MODULES Keys: ", Object.keys(MODULES));
    Object.keys(MODULES).map((Mk) => initM(Mk));
    console.log("Termina init, muestra panel segun setupMode", app16.P.System.SetupMode.value1);
    if (app16.P.System.SetupMode.value1 == true) {
      focusM2("Help");
    } else {
      focusM2("Home");
    }
    setInterval(async () => {
      const res = await app16.get("/statusflow.html");
      V16.statusFlowNavBar.innerHTML = res.ok ? res.text : "No status response.";
    }, 3e3);
  }
  init16();
})();
