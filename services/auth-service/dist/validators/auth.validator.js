"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleTokenValidator = exports.resetPasswordValidator = exports.forgotPasswordValidator = exports.refreshTokenValidator = exports.loginValidator = exports.resendOTPValidator = exports.verifyEmailValidator = exports.registerValidator = void 0;
const joi_1 = __importDefault(require("joi"));
// Password regex: 8+ chars, uppercase, lowercase, number, special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#^()_\-+=[\]{}|:;,./<>~@$!%*?&])[A-Za-z\d#^()_\-+=[\]{}|:;,./<>~@$!%*?&]{8,}$/;
const passwordValidation = joi_1.default.string()
    .min(8)
    .pattern(passwordRegex)
    .required()
    .messages({
    'string.pattern.base': 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special characters (e.g. #^()_-+=[]|:;,./<>~@$!%*?&)',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
});
const emailValidation = joi_1.default.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
});
const otpValidation = joi_1.default.string()
    .length(4)
    .pattern(/^\d{4}$/)
    .required()
    .messages({
    'string.length': 'OTP must be 4 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'any.required': 'OTP is required',
});
exports.registerValidator = {
    body: joi_1.default.object({
        firstName: joi_1.default.string()
            .min(2)
            .max(50)
            .trim()
            .required()
            .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required',
        }),
        lastName: joi_1.default.string()
            .min(2)
            .max(50)
            .trim()
            .required()
            .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required',
        }),
        email: emailValidation,
        password: passwordValidation,
    }),
};
exports.verifyEmailValidator = {
    body: joi_1.default.object({
        email: emailValidation,
        otp: otpValidation,
    }),
};
exports.resendOTPValidator = {
    body: joi_1.default.object({
        email: emailValidation,
    }),
};
exports.loginValidator = {
    body: joi_1.default.object({
        email: emailValidation,
        password: joi_1.default.string().required().messages({
            'any.required': 'Password is required',
        }),
    }),
};
exports.refreshTokenValidator = {
    body: joi_1.default.object({
        refreshToken: joi_1.default.string().required().messages({
            'any.required': 'Refresh token is required',
        }),
    }),
};
exports.forgotPasswordValidator = {
    body: joi_1.default.object({
        email: emailValidation,
    }),
};
exports.resetPasswordValidator = {
    body: joi_1.default.object({
        email: emailValidation,
        otp: otpValidation,
        newPassword: passwordValidation,
    }),
};
exports.googleTokenValidator = {
    body: joi_1.default.object({
        googleToken: joi_1.default.string().required().messages({
            'any.required': 'Google token is required',
        }),
    }),
};
//# sourceMappingURL=auth.validator.js.map