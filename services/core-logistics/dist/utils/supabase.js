"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.getSupabase = exports.initSupabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
let supabase;
const initSupabase = () => {
    if (!supabase) {
        supabase = (0, supabase_js_1.createClient)(config_1.default.supabase.url, config_1.default.supabase.anonKey);
        logger_1.default.info('Supabase client initialized');
    }
    return supabase;
};
exports.initSupabase = initSupabase;
const getSupabase = () => {
    if (!supabase) {
        return (0, exports.initSupabase)();
    }
    return supabase;
};
exports.getSupabase = getSupabase;
const testConnection = async () => {
    try {
        const { error } = await (0, exports.getSupabase)().from('service_channels').select('count').limit(1);
        if (error) {
            logger_1.default.error('Supabase connection test failed:', error);
            return false;
        }
        logger_1.default.info('✅ Supabase connection successful');
        return true;
    }
    catch (error) {
        logger_1.default.error('Supabase connection test failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
exports.default = { initSupabase: exports.initSupabase, getSupabase: exports.getSupabase, testConnection: exports.testConnection };
//# sourceMappingURL=supabase.js.map