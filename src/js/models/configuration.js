import {Param} from './param.js'

export class Configuration {
    
        MakeImage= {
             LogImageLocation: new Param({help: 'Location to store raw images for logging'}),
             WaitBeforeTakingPicture: new Param({help: 'Wait time between illumination switch on and take the picture (in seconds)'}),
             LogfileRetentionInDays: new Param({help: 'Time to keep the raw image (in days -"0" = forever)'}),
             Brightness: new Param({help: 'Image Brightness (-2 .. 2 - default = "0"). Remark: camera driver is not fully supporting this setting yet (no impact on image)'}),
             Contrast: new Param({help: 'Image Contrast (-2 .. 2 - default = "0"). Remark: camera driver is not fully supporting this setting yet (no impact on image) '}),
             Saturation: new Param({help: 'Image Saturation (-2 .. 2 - default = "0") '}),
             LEDIntensity: new Param({help: 'Internal LED Flash Intensity (PWM from 0% - 100%). Remark: as the camera autoillumination settings are used, this is rather for energy saving, than reducingreflections.'}),
             ImageQuality: new Param({help: 'Quality index for picture (default = "12" - "0" high ... "63" low). Remark: values smaller than 12 can result in a reboot, as the bigger sized JPEG might not fit in theavailable RAM!'}),
             ImageSize: new Param({help: 'Picture size camera (default = "VGA")'}),     
             FixedExposure: new Param({help: 'Fixes the illumination setting of camera at the startup and uses this later --> individual round is faster.'}),     
             Negative: new Param({help: 'Ivert image color.'}),   
             FlipVer: new Param({help: ''}),
             FlipHor: new Param({help: ''})
        }

        Alignment= {
             InitialRotate: new Param({help: ''}),
             InitialMirror: new Param({help: ''}),
             SearchFieldX: new Param({help: 'x size (width) in which the reference is searched (default = "20")'}),
             SearchFieldY: new Param({help: 'y size (height) in which the reference is searched (default = "20")'}),     
             AlignmentAlgo: new Param({help: '"Default" = use only R-Channel, "HighAccuracy" = use all Channels (RGB, 3x slower),  "Fast" (First time RGB, then only check if image is shifted)'}),
             FlipImageSize: new Param({help: ''}),
        }

        Digits= {
             Model: new Param({help: 'Path to CNN model file for image recognition'}),
             CNNGoodThreshold: new Param({help: 'EXPERIMENTAL - NOT WORKING FOR ALL CNNs! - Threshold above which the classification should be to accept the value (only for digits meaningfull)'}),
             LogImageLocation: new Param({help: 'Location to store separated digits for logging'}),
             LogfileRetentionInDays: new Param({help: 'Time to keep the separated digit images (in days -"0" = forever)'}),
             //ModelInputSize: new Param({help: ''})

        }

        Analog= {
             Model: new Param({help: 'Path to CNN model file for image recognition'}),
             LogImageLocation: new Param({help: 'Location to store separated digits for logging'}),
             LogfileRetentionInDays: new Param({help: 'Time to keep the separated digit images (in days -"0" = forever)'}),
             ModelInputSize: new Param({ anzParam: 2 })
        }

        PostProcessing= {
             PreValueUse: new Param({help: 'Enable to use the previous read value for consistency checks - also on reboots'}),
             PreValueAgeStartup: new Param({help: 'Time (in minutes), how long a previous read value is valid after reboot (default = 720 min)'}),
             AllowNegativeRates: new Param({help: 'Set on "false" to ensure, that only positive changes are accepted (typically for counter)'}),
             ErrorMessage: new Param({help: 'Do not show error message in return value - in error case, the last valid number will be send out'}),
             CheckDigitIncreaseConsistency: new Param({help: 'Enable additional consistency check - especially zero crossing check between digits'}), 
             //DecimalShift: new Param({help: 'Shift the digit separator within the digital digits (positiv and negativ)'}), 
             //MaxRateValue: new Param({help: 'Maximum change of a reading - if threated as absolute or relative change see next parameter.'}), 
             //MaxRateType: new Param({help: 'Defines if the change rate compared to the previous value is calculated as absolute change (AbsoluteChange) or as rate normalized to the intervall (RateChange = change/minute).'}), 
             //ExtendedResolution: new Param({help: 'Enable to use the after point resolution for the last analog counter'}), 
             //IgnoreLeadingNaN: new Param({help: 'Leading "N"s will be deleted before further processing'}), 
        
          }

        MQTT= {
             Uri: new Param({help: 'URI to the MQTT broker including port e.g.: mqtt://IP-Address:Port'}),
             MainTopic: new Param({help: 'MQTT main topic, under which the counters are published. The single value will be published with the following key: MAINTOPIC/VALUE_NAME/PARAMETER  where parameters are: value, rate, timestamp, error The general connection status can be found in MAINTOPIC/CONNECTION'}),
             //Topic: new Param({help: ''}), NEW MainTopic
             ClientID: new Param({help: 'ClientID to connect to the MQTT broker'}),
             user: new Param({help: 'User for MQTT authentication'}),
             password: new Param({help: 'Password for MQTT authentication'}),
             SetRetainFlag: new Param({help: 'Enable or disable the retain flag for all MQTT entries'}),
        }

        InfluxDB= {
             Uri: new Param({help: 'URI of the HTTP interface to InfluxDB, without traililing slash, e.g. http://IP-Address:Port'}),
             Database: new Param({help: 'Database name in which to publish the read value.'}),
             Measurement: new Param({help: 'Measurement name to use to publish the read value.'}),
             user: new Param({help: 'User for InfluxDB authentication'}),
             password: new Param({help: 'Password for InfluxDB authentication'}),
        }

        GPIO= {
             IO0: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/]}),
             IO1: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/]}),
             IO3: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/]}),
             IO4: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/]}),
             IO12: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/]}),
             IO13: new Param({ anzParam: 6, checkRegExList: [null, null, /^[0-9]*$/, null, null, /^[a-zA-Z0-9_-]*$/]}),
             LEDType: new Param({value1: "WS2812"}),
             LEDNumbers: new Param({value1: 2}),
             LEDColor: new Param({anzParam: 3, value1: 50,value2: 50,value3: 50})
        }

        AutoTimer= {
             AutoStart: new Param({help: 'Start the image recognition immediatly after power up. false is basically for debugging.'}),
             Intervall: new Param({help: 'Intervall in which the counter is read (in minutes). Number must be greater than 3 minutes.'}),     
        }

        Debug= {
             Logfile: new Param({help: 'Turn on/off the extended logging'}),
             LogfileRetentionInDays: new Param({help: 'Time to keep the log files (in days - "0" = forever)'}),
        }

        System= {
             TimeZone: new Param({help: 'Time zone in POSIX syntax (Europe/Berlin = "CET-1CEST,M3.5.0,M10.5.0/3" - incl. daylight saving)'}),
             TimeServer: new Param({help: 'Time server to synchronize system time (default: "pool.ntp.org" - used if nothing is specified)'}),         
             AutoAdjustSummertime: new Param({help: ''}),
             Hostname: new Param({help: 'Hostname for server - will be transfered to wlan.ini at next startup)'}),   
             SetupMode: new Param({help: ''}), 
        }

}