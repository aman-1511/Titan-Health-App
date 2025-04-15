const RegexUtil = {
    VALID_EMAIL_REGEX: /.+@.+\.[A-Za-z]+$/,

    VALID_PHONE_REGEX: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,

    MIN_PASSWORD_LENGTH: 5,

    MIN_USERNAME_LENGTH: 1,

    isValidEmailFormat(input) {
        return this.VALID_EMAIL_REGEX.test(input);
    },

    isValidPhoneFormat(input) {
        return this.VALID_PHONE_REGEX.test(input);
    },

    isValidPasswordFormat(password) {
        return password.length >= this.MIN_PASSWORD_LENGTH;
    },

    isValidUsernameFormat(username) {
        return (username.length >= this.MIN_USERNAME_LENGTH && !username.includes(" "));
    },

    stripNonDigits(phoneNumber) {
        return phoneNumber.replace(/\D/g, '');
    },

    isValidErrorMessage(errorMessage) {
        return errorMessage.length > 0;
    }
}

export default RegexUtil;