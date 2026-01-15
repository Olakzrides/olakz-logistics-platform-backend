declare class UserService {
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<any>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, updates: any): Promise<any>;
    /**
     * Update user role
     */
    updateRole(userId: string, role: 'customer' | 'rider'): Promise<any>;
    /**
     * Change password
     */
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    /**
     * Format user data for response
     */
    private formatUserData;
}
declare const _default: UserService;
export default _default;
