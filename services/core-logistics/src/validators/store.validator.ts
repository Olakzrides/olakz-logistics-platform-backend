import Joi from 'joi';

export const serviceSelectionSchema = Joi.object({
  service_channel_name: Joi.string()
    .valid(
      'mobile_ride_sc',
      'mobile_delivery_sc',
      'mobile_food_sc',
      'mobile_market_place_sc',
      'mobile_bill_sc',
      'mobile_transport_hire_sc',
      'mobile_auto_wash_sc',
      'mobile_car-dealers_sc'
    )
    .required()
    .messages({
      'any.required': 'Service channel name is required',
      'any.only': 'Invalid service channel name',
    }),
  user_location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).optional(),
  metadata: Joi.object().optional(),
});
