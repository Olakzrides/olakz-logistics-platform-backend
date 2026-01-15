interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
declare class TokenService {
    /**
     * Generate access and refresh tokens
     */
    generateTokens(userId: string, email: string, role: string): Promise<TokenPair>;
    /**
     * Verify access token
     */
    verifyAccessToken(token: string): TokenPayload;
    /**
     * Verify refresh token and generate new tokens
     */
    refreshAccessToken(refreshToken: string): Promise<TokenPair>;
    /**
     * Store refresh token in database
     */
    private storeRefreshToken;
    /**
     * Revoke refresh token
     */
    revokeRefreshToken(refreshToken: string): Promise<void>;
    /**
     * Revoke all user tokens (logout from all devices)
     */
    revokeAllUserTokens(userId: string): Promise<void>;
    /**
     * Hash token for storage (don't store plain tokens)
     */
    private hashToken;
    /**
     * Cleanup expired tokens (call periodically)
     */
    cleanupExpiredTokens(): Promise<void>;
}
declare const _default: TokenService;
export default _default;
