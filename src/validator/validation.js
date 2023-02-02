const mongoose = require("mongoose");

const validName = function (name) {
    const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
    return nameRegex.test(name)
}

const validPhone = function (mobile) {
    const mobileRegex = /^[6789]\d{9}$/
    return mobileRegex.test(mobile)
}

const validEmail = function (email) {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-][a-z]{1,4}$/
    return emailRegex.test(email)
}

const isValidBody = function (object) {
    return Object.keys(object).length > 0;
}

const validValue = function (data) {
    if (typeof (data) === undefined || typeof (data) === null) { return false }
    if (typeof (data) === "string" && data.trim().length > 0) { return true }
    if (typeof (data) === "number" && data.trim().length > 0) { return true }
}

const validPincode = function (data) {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(data);
}

const validPassword = function (password) {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/
    return passwordRegex.test(password)
}

const validObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidImg = (img) => {
    const reg = /.+\.(?:(jpg|gif|png|jpeg|jfif))/;
    return reg.test(img);
  };

module.exports = { validName, validPhone, validEmail, validValue, validPincode,isValidImg, validPassword, validObjectId, isValidBody }