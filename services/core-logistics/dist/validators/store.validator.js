"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceSelectionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.serviceSelectionSchema = joi_1.default.object({
    service_channel_name: joi_1.default.string()
        .valid('mobile_ride_sc', 'mobile_delivery_sc', 'mobile_food_sc', 'mobile_market_place_sc', 'mobile_bill_sc', 'mobile_transport_hire_sc', 'mobile_auto_wash_sc', 'mobile_car-dealers_sc')
        .required()
        .messages({
        'any.required': 'Service channel name is required',
        'any.only': 'Invalid service channel name',
    }),
    user_location: joi_1.default.object({
        latitude: joi_1.default.number().min(-90).max(90).required(),
        longitude: joi_1.default.number().min(-180).max(180).required(),
    }).optional(),
    metadata: joi_1.default.object().optional(),
});
//# sourceMappingURL=store.validator.js.map