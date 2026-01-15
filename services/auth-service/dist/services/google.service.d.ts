declare class GoogleService {
    private client;
    constructor();
    /**
     * Get Google OAuth URL (for server-side flow)
     */
    getAuthUrl(): string;
    /**
     * Handle Google OAuth callback (server-side flow)
     */
    handleCallback(code: string): Promise<any>;
    /**
     * Verify Google token (client-side flow - for mobile)
     */
    verifyGoogleToken(idToken: string): Promise<any>;
    /**
     * Get user info from Google token
     */
    private getUserInfo;
    /**
     * Find or create user from Google info
     */
    private findOrCreateUser;
    /**
     * Generate username from email or name
     */
    private generateUsername;
}
declare const _default: GoogleService;
export default _default;
