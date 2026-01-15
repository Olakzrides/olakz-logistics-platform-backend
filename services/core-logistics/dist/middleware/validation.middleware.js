"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const response_1 = __importDefault(require("../utils/response"));
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const details = error.details.map((detail) => ({
                message: detail.message,
                path: detail.path,
                type: detail.type,
                context: detail.context,
            }));
            return response_1.default.error(res, 'Validation error', 400, 'VALIDATION_ERROR', details);
        }
        req.body = value;
        return next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map