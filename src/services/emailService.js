import nodemailer from 'nodemailer';

/**
 * Email service for handling all email communications using ES6 modules
 */
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Creates and configures the email transporter
   * @returns {Object} Nodemailer transporter
   */
  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Sends password reset email
   * @param {string} userEmail - User's email address
   * @param {string} userName - User's full name
   * @param {string} resetUrl - Password reset URL
   * @returns {Promise<Object>} Email sending result
   */
  async sendPasswordResetEmail(userEmail, userName, resetUrl) {
    try {
      const mailOptions = {
        from: `"Parroquia System" <${process.env.SMTP_FROM_EMAIL}>`,
        to: userEmail,
        subject: 'Recuperación de Contraseña - Sistema Parroquia',
        html: this.getPasswordResetEmailTemplate(userName, resetUrl)
      };

      // In development, just log the email content instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Development mode - Password reset email would be sent:');
        console.log(`To: ${userEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Reset URL: ${resetUrl}`);
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now()
        };
      }

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      // In development or test, don't fail if email can't be sent
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log(`⚠️ Email service failed, but continuing in ${process.env.NODE_ENV} mode`);
        return {
          success: true,
          messageId: `${process.env.NODE_ENV}-fallback-` + Date.now()
        };
      }
      
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Sends email verification email
   * @param {string} userEmail - User's email address
   * @param {string} userName - User's full name
   * @param {string} verificationUrl - Email verification URL
   * @returns {Promise<Object>} Email sending result
   */
  async sendEmailVerificationEmail(userEmail, userName, verificationUrl) {
    try {
      const mailOptions = {
        from: `"Parroquia System" <${process.env.SMTP_FROM_EMAIL}>`,
        to: userEmail,
        subject: 'Verificación de Email - Sistema Parroquia',
        html: this.getEmailVerificationTemplate(userName, verificationUrl)
      };

      // In development, just log the email content instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Development mode - Email verification would be sent:');
        console.log(`To: ${userEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Verification URL: ${verificationUrl}`);
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now()
        };
      }

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending email verification:', error);
      
      // In development or test, don't fail if email can't be sent
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log(`⚠️ Email service failed, but continuing in ${process.env.NODE_ENV} mode`);
        return {
          success: true,
          messageId: `${process.env.NODE_ENV}-fallback-` + Date.now()
        };
      }
      
      throw new Error('Failed to send email verification');
    }
  }

  /**
   * Sends welcome email to new users
   * @param {string} userEmail - User's email address
   * @param {string} userName - User's full name
   * @returns {Promise<Object>} Email sending result
   */
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const mailOptions = {
        from: `"Parroquia System" <${process.env.SMTP_FROM_EMAIL}>`,
        to: userEmail,
        subject: 'Bienvenido al Sistema Parroquia',
        html: this.getWelcomeEmailTemplate(userName)
      };

      // In development, just log the email content instead of sending
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Development mode - Welcome email would be sent:');
        console.log(`To: ${userEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`User: ${userName}`);
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now()
        };
      }

      const result = await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      
      // In development or test, don't fail if email can't be sent
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log('⚠️ Email service failed, but continuing in test/development mode');
        return {
          success: true,
          messageId: 'test-fallback-' + Date.now()
        };
      }
      
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Password reset email HTML template
   * @param {string} userName - User's full name
   * @param {string} resetUrl - Password reset URL
   * @returns {string} HTML template
   */
  getPasswordResetEmailTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este email.</p>
            <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            <p><strong>Este enlace expirará en 1 hora por seguridad.</strong></p>
            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
            <p>${resetUrl}</p>
          </div>
          <div class="footer">
            <p>© 2025 Sistema Parroquia. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email verification HTML template
   * @param {string} userName - User's full name
   * @param {string} verificationUrl - Email verification URL
   * @returns {string} HTML template
   */
  getEmailVerificationTemplate(userName, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verificación de Email</h1>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>¡Gracias por registrarte en nuestro sistema! Para completar tu registro, necesitas verificar tu dirección de email.</p>
            <a href="${verificationUrl}" class="button">Verificar Email</a>
            <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
            <p>${verificationUrl}</p>
          </div>
          <div class="footer">
            <p>© 2025 Sistema Parroquia. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Welcome email HTML template
   * @param {string} userName - User's full name
   * @returns {string} HTML template
   */
  getWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6f42c1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido!</h1>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>¡Bienvenido al Sistema de Gestión Parroquial!</p>
            <p>Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a todas las funcionalidades del sistema.</p>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          </div>
          <div class="footer">
            <p>© 2025 Sistema Parroquia. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
