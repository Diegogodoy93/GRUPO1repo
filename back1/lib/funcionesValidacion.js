
//Regex Email
function validateEmail(strEmail) {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return emailRegex.test(strEmail);
}
//Regex password
function validatePsw(strPsw) {
    console.log(strPsw)
    let pswRegex = /^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,}$/;
    console.log("pass", pswRegex.test(strPsw));
    return pswRegex.test(strPsw);
}
//Funcion de validación de Email && Password 
function validateCredentials(strEmail, strPsw){
    return (validatePsw(strPsw) && validateEmail(strEmail));
}

module.exports = validateCredentials;
module.exports = validateEmail;
module.exports = validatePsw;