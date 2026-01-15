"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3004', 10),
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:19006',
            'http://localhost:19000',
        ],
    },
    cache: {
        ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    },
    analytics: {
        enabled: process.env.ANALYTICS_ENABLED === 'true',
        batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '100', 10),
    },
    services: {
        maxSessionsPerUser: parseInt(process.env.MAX_SESSIONS_PER_USER || '1', 10),
        sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT || '60', 10),
    },
};
if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
}
exports.default = config;
//# sourceMappingURL=index.js.map