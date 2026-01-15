"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidator = exports.updateRoleValidator = exports.updateProfileValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#^()_\-+=[\]{}|:;,./<>~@$!%*?&])[A-Za-z\d#^()_\-+=[\]{}|:;,./<>~@$!%*?&]{8,}$/;
exports.updateProfileValidator = {
    body: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).trim().optional(),
        lastName: joi_1.default.string().min(2).max(50).trim().optional(),
        username: joi_1.default.string().min(3).max(30).alphanum().trim().optional(),
        phone: joi_1.default.string().min(10).max(20).pattern(/^\+?[0-9]+$/).optional().messages({
            'string.pattern.base': 'Phone number must contain only numbers and optional + prefix',
        }),
        avatarUrl: joi_1.default.string().uri().optional(),
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update',
    }),
};
exports.updateRoleValidator = {
    body: joi_1.default.object({
        role: joi_1.default.string().valid('customer', 'rider').required().messages({
            'any.only': 'Role must be either customer or rider',
            'any.required': 'Role is required',
        }),
        vehicleType: joi_1.default.string()
            .valid('bicycle', 'car', 'dispatch')
            .when('role', {
            is: 'rider',
            then: joi_1.default.required(),
            otherwise: joi_1.default.forbidden(),
        })
            .messages({
            'any.only': 'Vehicle type must be bicycle, car, or dispatch',
            'any.required': 'Vehicle type is required for riders',
        }),
    }),
};
exports.changePasswordValidator = {
    body: joi_1.default.object({
        currentPassword: joi_1.default.string().required().messages({
            'any.required': 'Current password is required',
        }),
        newPassword: joi_1.default.string()
            .min(8)
            .pattern(passwordRegex)
            .required()
            .messages({
            'string.pattern.base': 'New password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
            'string.min': 'New password must be at least 8 characters long',
            'any.required': 'New password is required',
        }),
    }),
};
//# sourceMappingURL=user.validator.js.map