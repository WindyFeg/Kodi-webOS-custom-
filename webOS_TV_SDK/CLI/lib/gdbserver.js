const util=require("util"),async=require("async"),path=require("path"),npmlog=require("npmlog"),novacom=require("./base/novacom"),luna=require("./base/luna"),errHndl=require("./base/error-handler"),hasProperty=require("./util/property"),installer=require("./install"),prefixPath="/media/developer/";let prefixAppPath=prefixPath+"apps/usr/palm/applications",prefixServicePath=prefixPath+"apps/usr/palm/services";const defaultGdbserverPort="9930";
(function(){const f=npmlog;f.heading="gdbserver";f.level="warn";const z={log:f,session:null,run:function(d,m,l){function n(a){f.verbose("gdbserver#_makeSession()");d.nReplies=1;d.session=new novacom.Session(d.device,a)}function h(a){f.verbose("gdbserver#run()#_getConfigs()");const e=d.session.getDevice().lunaAddr.deviceInfoConfig,b={configNames:["tv.nyx.platformVersion"],subscribe:!1};luna.sendWithoutErrorHandle(d,e,b,function(c,g){f.silly("gdbserver#run()#_getConfigs():","luna called");c?c.returnValue?
c.configs&&hasProperty(c.configs,b.configNames[0])?(c=c.configs[b.configNames[0]],f.verbose("gdbserver#run()#_getConfigs()","sdkVersion:",c),c=c.split("."),c=Number(c[0]),g(null,c)):(f.verbose("gdbserver#run()#_getConfigs():","configs not exist"),g(errHndl.getErrMsg("FAILED_CALL_LUNA","missingConfigs",null,e.service))):(f.verbose("gdbserver#run()#_getConfigs():","failure"),g(errHndl.getErrMsg("FAILED_CALL_LUNA",c.errorText?c.errorText:c.errorMessage?c.errorMessage:"",null,e.service))):g(errHndl.getErrMsg("INVALID_OBJECT"))},
a)}function u(a,e){function b(g){"0"===(Buffer.isBuffer(g)?g.toString().trim():g.trim())?e(null,a):(a=Number(a)+1,u(a,e))}f.verbose("gdbserver#run()#_findNewDebugPort()","gdbPort:",a);null===a&&(a=v);"function"===typeof a&&(e=a,a=v);const c=util.format("netstat -ltn 2>/dev/null | grep :%s | wc -l",a);async.series([function(g){d.session.run(c,process.stdin,b,process.stderr,g)}],function(g){if(g)return e(g)})}if("function"!==typeof l)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(l));
const t=this,p=d.appId,q=d.serviceId,v=defaultGdbserverPort,x=d.port||defaultGdbserverPort;if(!p&&!q)return l(errHndl.getErrMsg("EMPTY_VALUE","APP_ID"));let y=0;process.on("SIGINT",function(){f.verbose("This is SIGINT handling...");0<y++&&(f.verbose("To prevent hangup due to an abnormal disconnection"),process.exit(1));async.waterfall([n.bind(t),function(a,e){t.session=a;e()},t.getPidUsingPort.bind(t,t.port),t.killProcByPid.bind(t),function(a){t.session.end();setTimeout(a,500)}],function(a){a&&process.exit(1);
process.exit(0)})});async.waterfall([function(a){installer.list(d,function(e,b){b instanceof Array&&(d.instPkgs=b);a(e)})},n.bind(this),function(a,e){this.session=a;a.run("if ! type gdbserver > /dev/null; then echo 1; else echo 0; fi;",null,function(b){if("1"===(Buffer.isBuffer(b)?b.toString().trim():b.trim()))return e(Error("gdbserver command is not available in the target device"));setImmediate(e)},null,function(b){if(b)return setImmediate(e,b)})}.bind(this),function(a){f.verbose("gdbserver#run()#_getSdkVersion()");
const e=d.session.getDevice().lunaAddr.deviceInfoSystem,b={keys:["sdkVersion"],subscribe:!1};luna.sendWithoutErrorHandle(d,e,b,function(c,g){f.silly("gdbserver#run()#_getSdkVersion():","luna called");let k=c;k?hasProperty(k,b.keys[0])?(f.verbose("gdbserver#run()#_getSdkVersion()","sdkVersion:",k[b.keys[0]]),k=k[b.keys[0]],k=k.split("."),k=Number(k[0]),g(null,k)):(f.silly("gdbserver#run()#_getSdkVersion()","resultValue is empty"),f.verbose(errHndl.getErrMsg("FAILED_CALL_LUNA",c.errorText?c.errorText:
c.errorMessage?c.errorMessage:"",null,e.service)),h(g)):g(errHndl.getErrMsg("INVALID_OBJECT"))},a)}.bind(this),function(a,e){this.version=a;3<=this.version?e():e(errHndl.getErrMsg("NOT_SUPPORT_GDBSERVER"))}.bind(this),function(a){function e(r){k=Buffer.isBuffer(r)?r.toString().trim():r.trim();if("{"===k[0])f.verbose("gdbserver#run()#_readAppInfo()","metaData:",k),a(null,k);else return a(errHndl.getErrMsg("FAILED_GET_APPINFO"))}f.verbose("gdbserver#_readAppInfo()");const b=p||q;if(d.instPkgs){const r=
p?"applications":"services";d.instPkgs.every(function(w){return-1!==b.indexOf(w.id)?(prefixAppPath=prefixServicePath=path.join(path.dirname(w.folderPath),"..",r).replace(/\\/g,"/"),!1):!0})}let c;p?c=path.join(prefixAppPath,p,"appinfo.json"):q&&(c=path.join(prefixServicePath,q,"services.json"));c=c.replace(/\\/g,"/");const g="cat "+c;async.series([function(r){d.session.run(g,process.stdin,e,process.stderr,r)}],function(r){if(r)return a(errHndl.getErrMsg("FAILED_GET_APPINFO"))});let k}.bind(this),
function(a,e){f.verbose("gdbserver#run()#_getExecFileName()");try{const b=JSON.parse(a);if(p){if(!b.main)return e(errHndl.getErrMsg("INVALID_MAIN_FILE"));if("web"===b.type)return e(Error(b.id+" is not a native app"));this.execName=b.main}else if(q){if("native"!==b.engine)return e(Error(b.id+" is not a native service"));this.execName=b.executable}f.verbose("gdbserver#run()#_getExecFileName()","execName:",this.execName);e()}catch(b){e(b)}}.bind(this),this.getPidUsingPort.bind(this,v),this.killProcByPid.bind(this),
u.bind(this,v),function(a,e){this.port=a;f.verbose("gdbserver#run()#_getEnvFromDevice()");if("root"!==d.session.getDevice().username)setImmediate(e,null,"");else{f.verbose("gdbserver#run()#_getEnvFromDevice()","cmd:","find /etc/jail_native_devmode.conf 2>/dev/null | xargs awk '/setenv/{printf \"export %s=%s;\\n\", $2,$3}' | xargs echo");var b="";d.session.run("find /etc/jail_native_devmode.conf 2>/dev/null | xargs awk '/setenv/{printf \"export %s=%s;\\n\", $2,$3}' | xargs echo",null,function(c){b=
Buffer.isBuffer(c)?b.concat(c.toString()):b.concat(c);setImmediate(e,null,b)},null,function(c){if(c)return setImmediate(e,c)})}}.bind(this),function(a,e){f.verbose("gdbserver#run()#_addUserEnv()");let b;p?b={SDL_VIDEODRIVER:"wayland",XDG_RUNTIME_DIR:"/tmp/xdg",LD_LIBRARY_PATH:"$LD_LIBRARY_PATH:"+path.join(prefixAppPath,p,"lib").replace(/\\/g,"/")}:q&&(b={LD_LIBRARY_PATH:"$LD_LIBRARY_PATH:"+path.join(prefixServicePath,q,"lib").replace(/\\/g,"/")});a=a.concat(function(c){let g="";Object.keys(c).forEach(function(k){g=
g.concat("export ").concat(k).concat("=").concat(c[k]).concat(";")});return g}(b));e(null,a)}.bind(this),function(a,e){f.verbose("gdbserver#run()#_launchGdbserver()");var b;p?b=path.join(prefixAppPath,p):q&&(b=path.join(prefixServicePath,q));let c="";6===this.version?c="_ndk5":3<this.version&&(c="_ndk"+String(this.version));b=util.format("cd %s && gdbserver%s :%s %s",b,c,this.port,path.join(b,this.execName)).replace(/\\/g,"/");d.session.runNoHangup(a+b,function(g){g=Buffer.isBuffer(g)?g.toString():
g;console.log("[gdbserver] "+g)},function(){f.verbose("gdbserver#run()#_launchGdbserver#__exit");process.exit(0)},e)}.bind(this),function(a){f.verbose("gdbserver#run()#_portForward()");d.session.forward(this.port,x,a)}.bind(this),function(a){f.verbose("gdbserver#run()#_printForwardInfo()");const e=d.session.getDevice();console.log(" >> gdb can connect to [target remote",e.host+":"+this.port+"]\n");a()}.bind(this)],function(a,e){l(a,e)})},close:function(d,m,l){f.verbose("gdbserver#close()");m=d.port||
defaultGdbserverPort;if("function"!==typeof l)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(l));async.waterfall([function(n){d.nReplies=1;d.session=new novacom.Session(d.device,n)}.bind(this),function(n,h){this.session=n;h()}.bind(this),this.getPidUsingPort.bind(this,m),this.killProcByPid.bind(this),function(n){setTimeout(n,1E3)},this.closeSession],function(n,h){f.verbose("gdbserver#close()","err: ",n,"results:",h);l(n,h)})},getPidUsingPort:function(d,m){function l(h){(h=Buffer.isBuffer(h)?
h.toString().trim():h.trim())?(h=h.split(" ").filter(function(u){return""!==u.trim()}),m(null,h)):m()}f.verbose("gdbserver#getPidUsingPort()");"function"===typeof d&&(m=d,d=defaultGdbserverPort);if(this.session){var n=util.format("fuser -n tcp %s 2>/dev/null | awk '{print $0}' | xargs echo",d);async.series([function(h){this.session.run(n,process.stdin,l,process.stderr,h)}.bind(this)],function(h){if(h)return m(h)})}else m(Error("gdbserver#getPidUsingPort(): no session"))},killProcByPid:function(d,
m){f.verbose("gdbserver#killProcByPid()");if("function"===typeof d)return d();if(!this.session)return m(Error("gdbserver#killProcByPid(): no session"));let l=[];if(d instanceof Array)l=d;else if(d instanceof String)l.push(d);else return m(Error("gdbserver#killProcByPid(): no pid"));d=util.format("kill -9 %s 2>/dev/null",l.join(" "));this.session.runNoHangup(d,m)},closeSession:function(d){if(!this.session)return f.verbose("gdbserver#close()#closeSession()","This session is already terminated"),d();
this.session.end();this.session=null;d()}};"undefined"!==typeof module&&module.exports&&(module.exports=z)})();