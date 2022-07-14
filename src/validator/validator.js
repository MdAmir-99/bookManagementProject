const mongoose = require('mongoose')

const isValidField = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true
}

const isValidFieldNumber = function(value){
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' ) return false;
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidMobile = function (mobile) {
    return (/^[6-9]{1}[0-9]{9}$/.test(mobile))
}

const isValidEmail = function (email) {
    return (/^[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email.trim()))
}

const isValidPassword = function (password) {
    return (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/.test(password))
}

const isValidStreet = function (address){
    return (/^([a-zA-z0-9/\\''(),-\s]{5,255})$/.test(address.trim()))
}

const isValidPincode = function (pincode){
    return (/^[1-9][0-9]{5}$/.test(pincode))
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidName = function (name) {
    return (/^[a-z A-Z ]{2,30}$/.test(name.trim()))
}

const isValidExcerpt = function (excerpt) {
    return (/^[a-z A-Z 0-9]{4,100}$/.test(excerpt.trim()))
}

const isValidISBN = function (isbn) {
    return (/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(isbn))
}

const isReleasedAt = function (isReleasedAt){
    return(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/).test(isReleasedAt.trim())
}

const isValidUserTitle = function (title) {
    return (/^(Mrs|Mr|Miss)$/.test(title))
}

const isValidBookTitle = function (value) {
    return (/^[a-z A-Z 0-9]{2,30}$/.test(value))
}

const isValidRating = function (rating){
    return (/^[1-5]{1}$/.test(rating))
}

const isValidReview = function(review){
    return (/^[a-z A-Z ]{10,}$/.test(review.trim()))
}

module.exports = { isValidField, isValidRequestBody, isValidStreet, isValidPincode, isValidFieldNumber, isReleasedAt ,isValidMobile, isValidRating, isValidReview, isValidEmail, isValidPassword, isValidObjectId, isValidName, isValidISBN, isValidUserTitle, isValidBookTitle, isValidExcerpt }
