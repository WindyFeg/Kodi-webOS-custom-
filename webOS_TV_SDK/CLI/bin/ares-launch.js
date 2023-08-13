const fs=require("fs"),path=require("path"),async=require("async"),log=require("npmlog"),nopt=require("nopt"),launchLib=require("./../lib/launch"),commonTools=require("./../lib/base/common-tools"),version=commonTools.version,cliControl=commonTools.cliControl,help=commonTools.help,setupDevice=commonTools.setupDevice,appdata=commonTools.appdata,errHndl=commonTools.errMsg,processName=path.basename(process.argv[1],".js");
process.on("uncaughtException",function(a){log.error("uncaughtException",a.toString());log.verbose("uncaughtException",a.stack);cliControl.end(-1)});2===process.argv.length&&process.argv.splice(2,0,"--help");
const knownOpts={close:Boolean,device:[String,null],"device-list":Boolean,help:Boolean,"hidden-help":Boolean,hosted:Boolean,"host-ip":[String,null],"host-port":[String,null],inspect:Boolean,level:"silly verbose info http warn error".split(" "),open:Boolean,params:[String,Array],running:Boolean,simulator:[String,null],version:Boolean},shortHands={c:["--close"],d:["--device"],D:["--device-list"],h:["--help"],hh:["--hidden-help"],H:["--hosted"],P:["--host-port"],I:["--host-ip"],i:["--inspect"],v:["--level",
"verbose"],o:["--open"],p:["--params"],r:["--running"],s:["--simulator"],V:["--version"]},argv=nopt(knownOpts,shortHands,process.argv,2);log.heading=processName;log.level=argv.level||"warn";launchLib.log.level=log.level;log.verbose("argv",argv);argv.level&&(delete argv.level,0===argv.argv.remain.length&&1===Object.keys(argv).length&&(argv.help=!0));
const options={device:argv.device,inspect:argv.open||argv.inspect,open:argv.open,installMode:"Installed",hostPort:argv["host-port"],hostIp:argv["host-ip"],webOSTV:argv.simulator},appId=argv.argv.remain[0];1<argv.argv.remain.length&&finish("Please check arguments");let op,params={};
argv.help||argv["hidden-help"]?(showUsage(argv["hidden-help"]),cliControl.end()):argv.close?op=close:argv.running?op=running:argv["device-list"]?setupDevice.showDeviceList(finish):argv.version?version.showVersionAndExit():argv.hosted?(options.installMode="Hosted",op=launchHostedApp):op=argv.simulator?launchSimulator:launch;op&&version.checkNodeVersion(function(){async.series([op.bind(this)],finish)});
function showUsage(a){a?help.display(processName,appdata.getConfig(!0).profile,a):help.display(processName,appdata.getConfig(!0).profile)}function launch(){const a=appId;params=getParams();log.info("launch():","pkgId:",a);a?launchLib.launch(options,a,params,finish):(showUsage(),cliControl.end(-1))}
function launchHostedApp(){log.info("launchHostedApp():","pkgId:","com.sdk.ares.hostedapp",", appDir:",appId);if(!appId)return finish(errHndl.getErrMsg("EMPTY_VALUE","APP_DIR"));if(options.hostIp){if("true"===options.hostIp)return finish(errHndl.getErrMsg("EMPTY_VALUE","HOST_IP"));if(!/^(?:(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/mg.exec(options.hostIp))return finish(errHndl.getErrMsg("INVALID_IP",options.hostIp))}if(!fs.existsSync(path.normalize(appId)))return finish(errHndl.getErrMsg("NOT_EXIST_PATH",
appId));options.hostedurl=fs.realpathSync(appId);params=getParams();launchLib.launch(options,"com.sdk.ares.hostedapp",params,finish)}
function launchSimulator(){log.info("launchSimulator():","webOSTV:",options.webOSTV,"/ appDir:",appId);if(appId){const a=path.resolve(appId);if(!fs.existsSync(a))return finish(errHndl.getErrMsg("NOT_EXIST_PATH",appId));if(!fs.statSync(a).isDirectory())return finish(errHndl.getErrMsg("NOT_DIRTYPE_PATH",appId));if("true"===options.webOSTV)return finish(errHndl.getErrMsg("EMPTY_VALUE","WEBOS_TV_VERSION"));params=getParams();launchLib.launchSimulator(options,a,params,finish)}else return finish(errHndl.getErrMsg("EMPTY_VALUE",
"APP_DIR"))}function getParams(){const a=argv.params||[];params={};1===a.length&&-1!==a[0].indexOf("{")&&-1!==a[0].indexOf("}")&&0===(a[0].split("'").length-1)%2&&(a[0]=a[0].replace(/'/g,'"'));a.forEach(function(c){try{var b=JSON.parse(c);for(const d in b)params[d]=b[d]}catch(d){b=c.split("="),2===b.length?params[b[0]]=b[1]:log.warn("Ignoring invalid arguments:",c)}});log.info("getParams():","params:",JSON.stringify(params));return params}
function close(){const a=appId;log.info("close():","pkgId:",a);a||(showUsage(),cliControl.end(-1));launchLib.close(options,a,params,finish)}function running(){launchLib.listRunningApp(options,null,function(a,c){let b="",d=0;c instanceof Array&&c.forEach(function(e){0!==d++&&(b=b.concat("\n"));b=b.concat(e.id)});console.log(b);finish(a)})}
function finish(a,c){if(a){if(Array.isArray(a)&&0<a.length){for(const b in a)log.error(a[b].heading,a[b].message);log.verbose(a[0].stack)}else log.error(a.toString()),log.verbose(a.stack);cliControl.end(-1)}else c&&c.msg&&console.log(c.msg),cliControl.end()};