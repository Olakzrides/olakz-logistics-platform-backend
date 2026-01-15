"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
// Create Supabase client
const supabase = (0, supabase_js_1.createClient)(config_1.default.supabase.url, config_1.default.supabase.anonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// Test connection
async function testConnection() {
    try {
        const { error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
        if (error) {
            logger_1.default.error('Supabase connection test failed:', error);
            throw error;
        }
        logger_1.default.info('✅ Supabase connection successful');
    }
    catch (error) {
        logger_1.default.error('❌ Failed to connect to Supabase:', error);
        process.exit(1);
    }
}
// Test connection on startup
testConnection();
exports.default = supabase;
//# sourceMappingURL=supabase.js.map