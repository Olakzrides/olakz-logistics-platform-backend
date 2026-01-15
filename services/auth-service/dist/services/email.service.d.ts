declare class EmailService {
    private transporter;
    constructor();
    /**
     * Verify SMTP connection
     */
    private verifyConnection;
    /**
     * Send OTP email (HTML format)
     */
    sendOTPEmail(to: string, firstName: string, otp: string, type: 'verification' | 'password_reset'): Promise<void>;
    /**
     * Send welcome email after verification
     */
    sendWelcomeEmail(to: string, firstName: string): Promise<void>;
    /**
     * Send generic email
     */
    private sendEmail;
    /**
     * OTP Email Template (HTML)
     */
    private getOTPEmailTemplate;
    /**
     * Welcome Email Template
     */
    private getWelcomeEmailTemplate;
}
declare const _default: EmailService;
export default _default;
