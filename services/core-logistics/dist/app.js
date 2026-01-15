"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
require("express-async-errors");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
const response_1 = __importDefault(require("./utils/response"));
const errors_1 = require("./utils/errors");
// Routes
const store_routes_1 = __importDefault(require("./routes/store.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const app = (0, express_1.default)();
// Trust proxy
app.set('trust proxy', 1);
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.default.cors.allowedOrigins,
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, _res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`);
    next();
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        service: 'Core Logistics Service',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            storeInit: 'GET /store/init',
            selectService: 'POST /services/select',
            serviceContext: 'GET /services/context',
        },
    });
});
// Health check
app.use('/health', health_routes_1.default);
// API Routes
app.use('/store', store_routes_1.default);
app.use('/services', store_routes_1.default);
// 404 handler
app.use((req, res) => {
    response_1.default.error(res, `Route ${req.originalUrl} not found`, 404);
});
// Global error handler
app.use((err, req, res, _next) => {
    logger_1.default.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    if (err instanceof errors_1.AppError) {
        return response_1.default.error(res, err.message, err.statusCode, err.code);
    }
    // Joi validation errors
    if (err.name === 'ValidationError') {
        return response_1.default.error(res, 'Validation error', 400, 'VALIDATION_ERROR', err);
    }
    // Default error
    return response_1.default.error(res, config_1.default.env === 'production' ? 'Internal server error' : err.message, 500);
});
exports.default = app;
//# sourceMappingURL=app.js.map