
/**
 * Created by fiver on 2017/3/1.
 */
var express = require('express');
var router = express.Router();
var async=require('async');
var sys = require('sys');
var exec = require('child_process').exec;
var fs=require("fs");
var getIMEI=require('../getIMEI.js');
var sendInfo={
    eth0_mac_addr:"",
    wlan0_mac_addr:"",
	wlan0_ip:"",
    IMEI:{
        ppp0:"",
        ppp2:"",
        ppp4:""
    },
    ip_addr:"",
    ping_status:{
        ppp0:false,
        ppp2:false,
        ppp4:false
    },
    ping_tunnel_status:false,
    ping_outside_status:false,
	wlan0_SSID:"",
	wlan0_password:"",
	series_number:"",
	mer_ip:"",
	port:""
}
function getInfo(res){
    var command="";
    async.series([
            function(callback){
                command="ifconfig eth0 | grep 'inet addr:' | awk '{print $2}' | cut -c 6-";
                exec(command,function(err,stdout,stderror){
                  if(err)
                      console.log(err);
                  else
                    sendInfo.ip_addr=stdout.toString().replace("\n","");
                  callback(null,null) ;
                });
            },
            function(callback){
                command="ifconfig wlan0 | grep 'inet addr:' | awk '{print $2}' | cut -c 6-";
                exec(command,function(err,stdout,stderror){
                  if(err)
                      console.log(err);
                  else
                    sendInfo.wlan0_ip=stdout.toString().replace("\n","");;
                  callback(null,null) ;
                });
            },
            function(callback){
                command="ifconfig eth0 | grep 'HWaddr' | awk '{print $5}'";
                exec(command,function(err,stdout,stderror){
                    if(err)
                        console.log(err);
                    else
                        sendInfo.eth0_mac_addr=stdout.toString().replace("\n","");

                    callback(null,null) ;
                });
            },

            function(callback){
                command="ifconfig wlan0 | grep 'HWaddr' | awk '{print $5}'";
                exec(command,function(err,stdout,stderror){
                    if(err)
                        console.log(err);
                    else
                        sendInfo.wlan0_mac_addr=stdout.toString().replace("\n","");
                    callback(null,null) ;
                });
            },
            function(callback){
                command="dmidecode -t processor |grep ID";
                exec(command,function(err,stdout,stderror){
                    if(err)
                        console.log(err);
                    else
                        sendInfo.series_number=stdout.toString().substr(4);
                    callback(null,null) ;
                });
			},
            function(callback){
                command="ping 114.114.114.114 -c 10 -i 0.01";
                exec(command,function(err,stdout,stderror) {
                    if (stderror){
                        console.log(stderror);
                        sendInfo.ping_outside_status=false;
                    }
                    else {
                        var tmp = stdout.split('% packet loss');
                        sendInfo.ping_outside_status=parseInt(tmp[0].substr(-3).replace(",",""))<=20?true:false;
                    }
                    callback(null,null) ;
                });
            },
            function(callback){
                command="ping 10.0.0.1 -c 10 -i 0.01";
                exec(command,function(err,stdout,stderror) {
                    if (stderror){
                        console.log(stderror);
                        sendInfo.ping_tunnel_status=false;
                        //throw stderror;
                    }
                    else {
                        var tmp = stdout.split('% packet loss');
                        sendInfo.ping_tunnel_status=parseInt(tmp[0].substr(-3).replace(",",""))<=20?true:false;
                    }
                    callback(null,null) ;
                });
            },
            function(callback){
                command="ping 114.114.114.114 -c 10 -i 0.01 -I ppp0";
                exec(command,function(err,stdout,stderror) {
                    if (stderror){
                        console.log(stderror);
						sendInfo.ping_status.ppp0=false;
                        //throw stderror;
                    }
                    else {
                        var tmp = stdout.split('% packet loss');
                        sendInfo.ping_status.ppp0=parseInt(tmp[0].substr(-3).replace(",",""))<=20?true:false;
                    }
                    callback(null,null) ;
                });
            },
            function(callback){
                command="ping 114.114.114.114 -c 10 -i 0.01 -I ppp2";
                exec(command,function(err,stdout,stderror) {
                    if (stderror){
                        console.log(stderror);
						sendInfo.ping_status.ppp2=false;
                        //throw stderror;
                    }
                    else {
                        var tmp = stdout.split('% packet loss');
                        sendInfo.ping_status.ppp2=parseInt(tmp[0].substr(-3).replace(",",""))<=20?true:false;
                    }
                    callback(null,null) ;
                });
            },
            function(callback){
                command="ping 114.114.114.114 -c 10 -i 0.01 -I ppp4";
                exec(command,function(err,stdout,stderror) {
                    if (stderror){
                        console.log(stderror);
						sendInfo.ping_status.ppp4=false;
                        //throw stderror;
                    }
                    else {
                        var tmp = stdout.split('% packet loss');
                        sendInfo.ping_status.ppp4=parseInt(tmp[0].substr(-3).replace(",",""))<=20?true:false;
                    }
                    callback(null,null) ;
                });
            },
			function(callback){
					fs.readFile('/home/wlan0.conf','utf-8',function(err,data){
					  if(err){
						console.log(err);
					  }
					  else{
						var array_temp=data.split('\n');
						for(var item in array_temp){
						  var item0=array_temp[item];
						  if(item0.substr(0,4)=='ssid'){
							sendInfo.wlan0_SSID=item0.substr(5);
						  }
						  if(item0.substr(0,14)=='wpa_passphrase'){
							sendInfo.wlan0_password=item0.substr(15);
						  }
						  ;
						}
					  }
					});


				callback(null,null);
			},
			function(callback){
				fs.exists("/home/IMEI_CTC1.txt",function(exist){
					if(!exist) fs.open("/home/IMEI_CTC1.txt","w+",function(err,fd){if(err)console.log(err)});
					callback(null,null);

				});
			},
			function(callback){
				fs.exists("/home/IMEI_CMCC1.txt",function(exist){
					if(!exist) fs.open("/home/IMEI_CMCC1.txt","w+",function(err,fd){if(err)console.log(err)});
					callback(null,null);

				});
			},
			function(callback){
				fs.exists("/home/IMEI_UNICOM1.txt",function(exist){
					if(!exist) fs.open("/home/IMEI_UNICOM1.txt","w+",function(err,fd){if(err)console.log(err)});
					 callback(null,null);
				});
			},
		    
            function(callback){
                getIMEI.getIMEI(1);
				//console.log("after getIMEI");
				sleep(50);
                callback(null,null) ;
            },
            function(callback){
                var tmp=fs.readFileSync("/home/IMEI_CTC1.txt","utf-8");
                if(tmp!="") {
					var x=tmp.split('\n')
					
					if(x.length>1)	sendInfo.IMEI.ppp0=x[1].replace("\r","");
					console.log(x[1]);
				}
				else console.log('empty');
				callback(null,null) ;
            },
            function(callback){
                getIMEI.getIMEI(2);
				//console.log("after getIMEI");
				sleep(50);
                callback(null,null) ;
            },
            function(callback){
                var tmp=fs.readFileSync("/home/IMEI_CMCC1.txt","utf-8");
                if(tmp!="") {
					var x=tmp.split('\n');
					if(x.length>1)	sendInfo.IMEI.ppp4=x[1].replace("\r","");
					console.log(x[1]);
				}
				else console.log('empty');
				callback(null,null) ;
            },
            function(callback){
                getIMEI.getIMEI(3);
				//console.log("after getIMEI");
				sleep(50);
                callback(null,null) ;
            },
            function(callback){
                var tmp=fs.readFileSync("/home/IMEI_UNICOM1.txt","utf-8");
                if(tmp!="") {
					var x=tmp.split('\n');
					if(x.length>1)	sendInfo.IMEI.ppp2=x[1].replace("\r","");
					console.log(x[1]);
				}
				else console.log('empty');
				callback(null,null) ;
            },
			function(callback){
				fs.exists("/home/remote.conf",function(exist){
					if(exist){
						var bb=fs.readFileSync("/home/remote.conf","utf-8");
						var aa=bb.split("\n");
						if(aa.length>1){
							sendInfo.mer_ip=aa[0];
							sendInfo.port=aa[1];
						}
					}
				});
				callback(null,null);
			}

        ],
        function(error,stdout) {
			exec("ps aux|grep /dev |grep -v grep|awk '{print $2}'|xargs kill",function(err,stdout,stderror){
					if(err) console.log(err);
					console.log("kill cat");
			});
            if (error) {
                console.log(error);

            } else {
               
				if(sendInfo.IMEI.ppp0!=""){
                	res.send(sendInfo);
					console.log("send suc");
				}else{
					res.send("");
					console.log("send null")
				}

            }
        }
    )}

router.get('/',function(req,res,next){
	
	var mer_ip=req.query.mer_ip;
	var port=req.query.port;
	console.log(mer_ip,":",port);
	res.header("Access-Control-Allow-Origin","*");
	if(mer_ip!=null&port!=null){
		 console.log(mer_ip);
		change_merip(mer_ip,port,res);
	}else{
   		 getInfo(res);
	}

});
function change_merip(mer_ip,port,res){
    async.series([
            function(callback){
                fs.exists("/home/remote.conf",function(exist){
                    if(!exist){
                            fs.open("/home/remote.conf","w+",function(err,fd){
								if(err) console.log(err);
							});
							fs.writeFileSync('/home/remote.conf','59.110.61.100\n7777\n');
							callback(null,null);
                    }else{
                    	callback(null,null);
					}
                })
            },
        function(callback){
            exec("sed -i '1c "+mer_ip+"' /home/remote.conf",function(err,stdout,stderr){
                if(err)console.log(err);
                callback(null,null);
            });
        },
        function(callback){
            exec("sed -i '2c "+port+"' /home/remote.conf",function(err,stdout,stderr){
                if(err)console.log(err);
                callback(null,null);
            });
        }
        ],
        function(error,stdout){
            if(error) console.log(error);
            res.send('success');
        })

}
function sleep(n){
	var start=new Date().getTime();
	while(1){
		if(new Date().getTime()-start>n) break;
	}
}
module.exports = router;
