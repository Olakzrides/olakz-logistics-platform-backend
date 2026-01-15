interface Config {
    env: string;
    port: number;
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey?: string;
    };
    cors: {
        allowedOrigins: string[];
    };
    cache: {
        ttl: number;
    };
    analytics: {
        enabled: boolean;
        batchSize: number;
    };
    services: {
        maxSessionsPerUser: number;
        sessionTimeoutMinutes: number;
    };
}
declare const config: Config;
export default config;
//# sourceMappingURL=index.d.ts.map