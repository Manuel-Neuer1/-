var DESUtils = {
    splitNum:1000,
    encode:function(message,key){
        var splitNum = DESUtils.splitNum;
        var length = message.length;
        var finalStr = "";
        var k=1;
        if(length<splitNum){
           finalStr = DESUtils.simpleEncode(message,key);
        }else{
           for(var i=1;i*splitNum<length;i++){
               finalStr = finalStr + DESUtils.simpleEncode(message.substring(i*splitNum-splitNum,i*splitNum),key) + ",";
               k=i;
           }
           finalStr = finalStr + DESUtils.simpleEncode(message.substring(k*splitNum,length),key);
        }
        return finalStr;
    },
    simpleEncode:function(message,key){
          var keyHex = CryptoJS.enc.Utf8.parse(key);
          var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
              mode: CryptoJS.mode.ECB,
              padding: CryptoJS.pad.Pkcs7
          });
          return encrypted.toString();
    },
    decode:function(ciphertext,key){
        var keyHex = CryptoJS.enc.Utf8.parse(key);
        var decrypted = CryptoJS.DES.decrypt({
            ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
        }, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}