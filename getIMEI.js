/**
 * Created by fiver on 2017/3/3.
 */
var exec=require('child_process').exec;
function getIMEI(flag){
    var command1="",command2="";
    switch (flag) {
        case 1:
            command1 = "echo -e 'AT+CGSN\r' > /dev/PATTERN_CTC1";
            command2 = "cat /dev/PATTERN_CTC1 > /home/IMEI_CTC1.txt";
            break;
        case 2:
            command1 = "echo -e 'AT+CGSN\r' > /dev/PATTERN_CMCC1";
            command2 = "cat /dev/PATTERN_CMCC1 > /home/IMEI_CMCC1.txt";
            break;
        case 3:
            command1 = "echo -e 'AT+CGSN\r' > /dev/PATTERN_UNICOM1";
            command2 = "cat /dev/PATTERN_UNICOM1 > /home/IMEI_UNICOM1.txt";
            break;
    }
    exec(command1,function(err,stdout,stderror){
        if(err){
            console.log(err);
        }
        else{
			console.log("command1 after");
            exec(command2,function(err,stdout,stderror){
                if(err) console.log(err);
                if(stderror) console.log(stderror);
				console.log("command2 after");
            })
        }
    })
}
module.exports.getIMEI=getIMEI;
