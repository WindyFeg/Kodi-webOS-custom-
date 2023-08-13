const util=require("util"),async=require("async"),path=require("path"),npmlog=require("npmlog"),request=require("request"),luna=require("./base/luna"),novacom=require("./base/novacom"),server=require("./base/server"),sdkenv=require("./base/sdkenv"),errHndl=require("./base/error-handler"),hasProperty=require("./util/property"),installer=require("./install"),launcher=require("./launch"),defaultAppInsptPort="9998",defaultNodeInsptPort="8080",defaultServiceDebugPort="5885";let platformNodeVersion="0";
const nodeBaseVersion="8";
(function(){const m=npmlog;m.heading="inspector";m.level="warn";const A={log:m,inspect:function(a,B,u){function w(d,g){const b=util.format("netstat -ltn 2>/dev/null | grep :%s | wc -l",d);async.series([a.session.run.bind(a.session,b,process.stdin,function(k){k=Buffer.isBuffer(k)?k.toString().trim():k.trim();if("0"===k)m.verbose("inspector#inspect()#_findNewDebugPort()","final dbgPort : "+d),g(null,d);else if("1"===k)d=Number(d)+1,w(d,g);else return g(errHndl.getErrMsg("FAILED_GET_PORT"))},process.stderr)],
function(k){k&&g(k)})}function x(d){let g=0;async.series([a.session.run.bind(a.session,"node -v",process.stdin,function(b){1<++g||(platformNodeVersion=Buffer.isBuffer(b)?b.toString().trim():b.trim(),b=platformNodeVersion.split("."),platformNodeVersion=Number(b[0].slice(1)),d())},process.stderr)],function(b){b&&d(b)})}if("function"!==typeof u)throw errHndl.getErrMsg("MISSING_CALLBACK","next",util.inspect(u));a.svcDbgInfo={};a&&hasProperty(a,"serviceId")&&(a.serviceId instanceof Array?a.serviceId.forEach(function(d){a.svcDbgInfo[d]=
{}}):a.svcDbgInfo[a.serviceId]={});async.series([function(d){(new sdkenv.Env).getEnvValue("BROWSER",function(g,b){a.bundledBrowserPath=b;d()})},function(d){if(!a.serviceId)return d();installer.list(a,function(g,b){b instanceof Array&&(a.instPkgs=b);d(g)})},function(d){a.nReplies=1;a.session=new novacom.Session(a.device,d)},function(d){m.verbose("inspector#inspect()#_runApp");if(!a.appId||a.running)return d();launcher.listRunningApp(a,null,function(g,b){b=[].concat(b);g=b.map(function(k){return k.id});
m.verbose("inspector#inspect()#_runApp#runAppIds",g.join(","));-1===g.indexOf(a.appId)?(m.verbose("inspector#inspect()#_runApp#launch",a.appId),launcher.launch(a,a.appId,{},d)):d()})},function(d){a.appId?a.session.forward(defaultAppInsptPort,a.hostPort||0,a.appId,d):d()},function(d){function g(e){const f=c.pop();if(!f)return e();request.get(l+f.reqPath,function(h,q,v){if(h||200!==q.statusCode)return e();h=JSON.parse(v);for(const n in h)if(-1!==h[n].url.indexOf(a.appId)||-1!==h[n].url.indexOf(a.localIP)){if(!h[n][f.propName])return e(errHndl.getErrMsg("USING_WEBINSPECTOR"));
l+=h[n][f.propName];c=[];break}e()})}function b(e,f){"@@ARES_CLOSE@@"===e?(f.status(200).send(),r=setTimeout(function(){process.exit(0)},2E3)):"@@GET_URL@@"===e&&(clearTimeout(r),f.status(200).send(l))}function k(e,f){e?process.exit(1):f&&f.msg&&a.open&&server.openBrowser("http://localhost:"+f.port+"/ares_cli/ares.html",a.bundledBrowserPath)}let l,r,c=[{reqPath:"/pagelist.json",propName:"inspectorUrl"},{reqPath:"/json/list",propName:"devtoolsFrontendUrl"}];a.appId&&(l="http://localhost:"+a.session.getLocalPortByName(a.appId),
a.session.target.noPortForwarding&&(m.verbose("inspector#inspect()","noPortForwarding"),l="http://"+a.session.target.host+":9998"),async.whilst(function(){return 0<c.length},g.bind(this),function(e){if(e)return d(e);console.log("Application Debugging - "+l);server.runServer(__dirname,0,b,k)}));d()},function(d){const g=Object.keys(a.svcDbgInfo).filter(function(b){return"undefined"!==b});async.forEachSeries(g,function(b,k){if(!b)return k();let l=defaultServiceDebugPort;const r=function(c,e){if(!a.svcDbgInfo[c].port)return e();
const f=a.session.getLocalPortByName(c),h=util.format("http://%s:%s/debug?port=%s","localhost",f,a.svcDbgInfo[c].port);let q;request.get(h,function(v,n){function y(t,p){"@@ARES_CLOSE@@"===t?(p.status(200).send(),q=setTimeout(function(){process.exit(0)},2E3)):"@@GET_URL@@"===t&&(clearTimeout(q),p.status(200).send(h))}function z(t,p){t?process.exit(1):p&&p.msg&&a.open&&server.openBrowser("http://localhost:"+p.port+"/ares_cli/ares.html",a.bundledBrowserPath)}v||200!==n.statusCode||(console.log("nodeInsptUrl:",
h),server.runServer(__dirname,0,y,z),e())})};async.waterfall([function(c){a.instPkgs&&a.instPkgs.every(function(e){return-1!==b.indexOf(e.id)?(a.svcDbgInfo[b].path=path.join(path.dirname(e.folderPath),"..","services",b).replace(/\\/g,"/"),!1):!0});if(!a.svcDbgInfo[b].path)return c(errHndl.getErrMsg("FAILED_GET_SVCPATH",b));c()},function(c){const e=path.join(a.svcDbgInfo[b].path,"services.json").replace(/\\/g,"/");let f;async.series([a.session.run.bind(a.session,"cat "+e,process.stdin,function(h){f=
Buffer.isBuffer(h)?h.toString().trim():h.trim();c(null,f)},process.stderr)],function(h){if(h)return c(errHndl.getErrMsg("FAILED_FIND_SERVICE",b))})},function(c,e){try{if("native"===JSON.parse(c).engine)return e(errHndl.getErrMsg("USE_GDB",b));e()}catch(f){e(f)}},function(c){a.nReplies=1;luna.send(a,{service:b,method:"quit"},{},function(){c()},c)},function(c){a.session.runNoHangup("mkdir -p "+a.svcDbgInfo[b].path+"/_ares",c)},w.bind(this,l),function(c,e){l=c;a.session.runNoHangup("echo "+l+" > "+a.svcDbgInfo[b].path+
"/_ares/debugger-port",e)},function(c){setTimeout(function(){c()},1E3)},function(c){a.svcDbgInfo[b].port=l;a.nReplies=1;luna.send(a,{service:b,method:"info"},{},function(){c()},c)},function(c){setTimeout(function(){c()},1E3)},x.bind(this),function(c){m.info("inspector#inspect()#doPortForward()","platformNodeVersion: "+platformNodeVersion+", nodeBaseVersion: "+nodeBaseVersion);platformNodeVersion<nodeBaseVersion?a.session.forward(defaultNodeInsptPort,a.hostPort||0,b,c):platformNodeVersion>=nodeBaseVersion&&
a.session.forward(l,a.hostPort||0,b,c)},function(c){a.session.runNoHangup("rm -rf "+a.svcDbgInfo[b].path+"/_ares",c)},function(c){if(platformNodeVersion<nodeBaseVersion)r(b,c);else if(platformNodeVersion>=nodeBaseVersion){a.open&&console.log('Cannot support "--open option" on platform node version 8 and later');const e='To debug your service, set "localhost:'+a.session.getLocalPortByName(b)+'" on Node Inspector Client(Chrome DevTools, Visual Studio Code, etc.).';console.log(e);c()}}],function(c,e){m.verbose("inspector#inspect()",
"err: ",c,"results:",e);k(c,e)})},function(b){d(b)})},function(d){m.verbose("inspector#inspect()","running...");setImmediate(d)}],function(d){setImmediate(u,d)})}};"undefined"!==typeof module&&module.exports&&(module.exports=A)})();
