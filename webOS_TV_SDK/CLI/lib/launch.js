const util=require("util"),async=require("async"),npmlog=require("npmlog"),path=require("path"),fs=require("fs"),semver=require("semver"),exec=require("child_process").exec,inspector=require("./inspect"),installer=require("./install"),luna=require("./base/luna"),novacom=require("./base/novacom"),errHndl=require("./base/error-handler"),fileWatcher=require("./base/file-watcher"),sdkenv=require("./base/sdkenv"),os=require("os");
(function(){const k=npmlog;k.heading="launcher";k.level="warn";const q={log:k,launch:function(a,l,m,g){if("function"!==typeof g)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(g));let e=!1;const d=this;a=a||{};async.series([function(b){"Hosted"===a.installMode?installer.list(a,function(c,f){for(const h in f)if("com.sdk.ares.hostedapp"===f[h].id){e=!0;break}b(c)}):b()},function(b){"Hosted"===a.installMode?d.listRunningApp(a,null,function(c,f){for(const h in f)if("com.sdk.ares.hostedapp"===
f[h].id){d.close(a,"com.sdk.ares.hostedapp",null,b);return}b(c)}):b()},function(b){if("Hosted"!==a.installMode||e)b();else{const c=path.join(__dirname,"com.sdk.ares.hostedapp.ipk");a.appId=l;installer.install(a,c,b)}},function(b){a.nReplies=1;a.session=new novacom.Session(a.device,b)},function(b){"Hosted"===a.installMode?(a.session.runHostedAppServer(a.hostedurl,b),console.log("Ares Hosted App is now running...")):b()},function(b){if("Hosted"===a.installMode){if(a.hostIp)a.localIP=a.hostIp;else{var c=
os.networkInterfaces();let f="";for(const h in c)for(let p=0;p<c[h].length;p++){const n=c[h][p];"IPv4"!==n.family||"127.0.0.1"===n.address||n.internal||(f=f||n.address,a.localIP=f)}}c=a.session.getHostedAppServerPort();null==m&&(m={});m.hostedurl="http://"+a.localIP+":"+c+"/"}b()},function(b){const c=a.session.getDevice().lunaAddr.launch,f=c.returnValue.split(".");luna.send(a,c,{id:l,subscribe:!1,params:m},function(h,p){k.silly("launcher#launch#_launch():","lineObj:",h);for(let n=1;n<f.length;n++)h=
h[f[n]];h?(k.verbose("launcher#launch#_launch():","success"),p(null,{procId:h})):(k.verbose("launcher#launch#_launch():","failure"),p(errHndl.getErrMsg("INVALID_OBJECT")))},b)},function(b){"Hosted"===a.installMode&&(k.verbose("launcher#launch#_runFileWatcher()"),a.appId=l,fileWatcher.watch(a));b()},function(b){k.verbose("launcher#launch#_runInspector()");a.inspect?(a.appId=l,a.running=!0,async.series([inspector.inspect.bind(inspector,a,null),function(){}],function(c){b(c)})):"Hosted"===a.installMode?
(process.on("SIGINT",function(){k.verbose("launcher#launch#_runInspector():","SIGINT is detected in Hosted mode");b()}),!0===a.testMode&&b()):b()}],function(b,c){c=c[6];if(!b)if("Hosted"!==a.installMode)c.msg="Launched application "+l;else{c.msg="";d.close(a,"com.sdk.ares.hostedapp",null,g);return}g(b,c)})},close:function(a,l,m,g){if("function"!==typeof g)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(g));a=a||{};async.series([function(e){a.nReplies=1;a.session=new novacom.Session(a.device,
e)},function(e){const d=a.session.getDevice().lunaAddr.terminate,b=d.returnValue.split(".");luna.send(a,d,{id:l,subscribe:!1},function(c,f){k.silly("launcher#close#_close():","lineObj:",c);for(let h=1;h<b.length;h++)c=c[b[h]];c?(k.verbose("launcher#close#_close():","success"),f(null,{procId:c})):(k.verbose("launcher#close#_close():","failure"),f(errHndl.getErrMsg("INVALID_OBJECT")))},e)}],function(e,d){d=d[1];!e&&d&&(d.msg="Hosted"!==a.installMode?"Closed application "+l:"...Closed Ares Hosted App");
g(e,d)})},listRunningApp:function(a,l,m){if("function"!==typeof m)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(m));a=a||{};async.waterfall([function(g){a.nReplies=1;a.session=new novacom.Session(a.device,g)},function(g,e){g=a.session.getDevice().lunaAddr.running;const d=g.returnValue.split(".");if(!g||!d)return e(errHndl.getErrMsg("NOT_SUPPORT_RUNNINGLIST"));luna.send(a,g,{subscribe:!1},function(b,c){let f=b;for(let h=1;h<d.length;h++)f=f[d[h]];f=f||[];b.returnValue?(k.verbose("launcher#listRunningApp():",
"success"),c(null,f)):(k.verbose("launcher#listRunningApp():","failure"),c(errHndl.getErrMsg("INVALID_OBJECT")))},e)}],function(g,e){m(g,e)})},launchSimulator:function(a,l,m,g){if("function"!==typeof g)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(g));a=a||{};async.waterfall([function(e){(new sdkenv.Env).getEnvValue("SDK",function(d,b){a.simulatorDir=b?path.join(b,"Simulator"):path.resolve(__dirname,"../../../Simulator");if(fs.existsSync(a.simulatorDir))if(fs.statSync(a.simulatorDir).isDirectory())console.log("Finding simulator in "+
a.simulatorDir),d=fs.readdirSync(a.simulatorDir),e(null,d);else return setImmediate(e,errHndl.getErrMsg("NOT_DIRTYPE_PATH",a.simulatorDir));else return setImmediate(e,errHndl.getErrMsg("NOT_EXIST_PATH",a.simulatorDir))})},function(e,d){a.simulatorPrefix=`webOS_TV_${a.webOSTV}_Simulator`;let b=[];for(let c=0;c<e.length;c++)0===e[c].indexOf(a.simulatorPrefix)&&fs.statSync(path.resolve(a.simulatorDir,e[c])).isDirectory()&&b.push(e[c].slice(a.simulatorPrefix.length+1));if(0===b.length)return setImmediate(d,
errHndl.getErrMsg("UNMATCHED_VERSION",a.simulatorPrefix));b=b.sort(semver.rcompare);a.simulatorVer=b[0];d()},function(e){var d="";switch(process.platform){case "win32":d="exe";break;case "linux":d="appimage";break;case "darwin":d="app"}const b=`${a.simulatorPrefix}_${a.simulatorVer}`,c=path.join(a.simulatorDir,b,`${b}.${d}`);if(!fs.existsSync(c))return setImmediate(e,errHndl.getErrMsg("NOT_EXIST_PATH",c));d=JSON.stringify(m).replace(/"/g,'\\"');d="darwin"===process.platform?`open "${c}" --args "${l}" "${d}"`:
`"${c}" "${l}" "${d}"`;k.verbose("launcher#launchSimulator#_launchSimulator():","cmd:",d);exec(d,function(f){if(f)return setImmediate(e,f);f={};f.msg="Launched "+path.basename(c);e(null,f)});setTimeout(function(){const f={};f.msg="Launched "+path.basename(c);e(null,f)},1E3)}],function(e,d){g(e,d)})}};"undefined"!==typeof module&&module.exports&&(module.exports=q)})();
