/**
 * Firestore Email Service using Firebase "Trigger Email" Extension
 * 
 * This service sends emails by writing documents to Firestore.
 * The Firebase "Trigger Email" extension automatically processes them.
 * 
 * Setup Required:
 * 1. Install "Trigger Email" extension from Firebase Console
 * 2. Configure email provider (SendGrid recommended)
 * 3. Set up email templates in extension configuration
 */

import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config.js';

class FirestoreEmailService {
  constructor() {
    // Collection watched by Trigger Email extension (MUST be 'mail')
    if (!firestore) {
      console.warn('Firestore not initialized. Email service will be disabled.');
      this.emailCollection = null;
    } else {
      this.emailCollection = collection(firestore, 'mail');
    }
  }

  /**
   * Get safe origin URL for email links
   * @returns {string} Origin URL
   */
  getOrigin() {
    return (typeof window !== 'undefined') ? window.location.origin : 'https://your-app-domain.com';
  }

  /**
   * Send room creation notification email
   * @param {Object} roomData - Room information
   * @param {string} recipientEmail - Email address to send to
   * @param {boolean} isAdmin - Whether this is for admin (different template)
   * @returns {Promise<Object>} Email send result
   */
  async notifyRoomCreated(roomData, recipientEmail, isAdmin = false) {
    if (!this.emailCollection) {
      console.warn('Firestore not available. Email notification skipped.');
      return { success: false, error: 'Firestore not initialized' };
    }
    
    try {
      const subject = isAdmin
        ? `🔔 Admin Alert: New room created - ${roomData.roomCode}`
        : `🃏 Planning Poker Room Created - ${roomData.roomCode}`;
      
      // Firebase Extension requires this EXACT structure
      const emailDoc = {
        to: [recipientEmail],
        message: {
          subject,
          html: this.generateRoomCreatedHTML(roomData, isAdmin),
          text: isAdmin
            ? `Admin Alert: New Planning Poker room ${roomData.roomCode} created by ${roomData.hostName}.`
            : `Your Planning Poker room ${roomData.roomCode} has been created successfully! Join at: ${this.getOrigin()}/room/${roomData.roomCode}`
        }
      };

      const docRef = await addDoc(this.emailCollection, emailDoc);
      
      return { 
        success: true, 
        messageId: docRef.id,
        provider: 'firebase-extension'
      };

    } catch (error) {
      console.error('❌ Failed to queue room creation email:', error);
      return { 
        success: false, 
        error: error.message,
        provider: 'firebase-extension'
      };
    }
  }

  /**
   * Send participant joined notification
   * @param {Object} participantData - Participant information  
   * @param {string} recipientEmail - Recipient email address
   * @param {boolean} isAdmin - Whether this is for admin (different template)
   * @returns {Promise<Object>} Email send result
   */
  async notifyParticipantJoined(participantData, recipientEmail, isAdmin = false) {
    if (!this.emailCollection) {
      console.warn('Firestore not available. Email notification skipped.');
      return { success: false, error: 'Firestore not initialized' };
    }
    
    try {
      const subject = isAdmin 
        ? `🔔 Admin Alert: New participant joined room ${participantData.roomCode}`
        : `👋 ${participantData.participantName} joined room ${participantData.roomCode}`;
        
      const emailDoc = {
        to: [recipientEmail],
        message: {
          subject,
          html: this.generateParticipantJoinedHTML(participantData, isAdmin),
          text: isAdmin
            ? `Admin Alert: ${participantData.participantName} has joined Planning Poker room ${participantData.roomCode}.`
            : `${participantData.participantName} has joined your Planning Poker room ${participantData.roomCode}.`
        }
      };

      const docRef = await addDoc(this.emailCollection, emailDoc);
      
      return { 
        success: true, 
        messageId: docRef.id,
        provider: 'firebase-extension'
      };

    } catch (error) {
      console.error('❌ Failed to queue participant joined email:', error);
      return { 
        success: false, 
        error: error.message,
        provider: 'firebase-extension'
      };
    }
  }

  /**
   * Send participant left notification
   * @param {Object} participantData - Participant information  
   * @param {string} recipientEmail - Email address to send to
   * @param {boolean} isAdmin - Whether this is for admin (different template)
   * @returns {Promise<Object>} Email send result
   */
  async notifyParticipantLeft(participantData, recipientEmail, isAdmin = false) {
    if (!this.emailCollection) {
      console.warn('Firestore not available. Email notification skipped.');
      return { success: false, error: 'Firestore not initialized' };
    }
    
    try {
      const subject = isAdmin
        ? `🔔 Admin Alert: Participant left room ${participantData.roomCode}`
        : `👋 ${participantData.participantName} left room ${participantData.roomCode}`;
        
      const emailDoc = {
        to: [recipientEmail],
        message: {
          subject,
          html: this.generateParticipantLeftHTML(participantData, isAdmin),
          text: isAdmin
            ? `Admin Alert: ${participantData.participantName} has left Planning Poker room ${participantData.roomCode}.`
            : `${participantData.participantName} has left your Planning Poker room ${participantData.roomCode}.`
        }
      };

      const docRef = await addDoc(this.emailCollection, emailDoc);
      
      return { 
        success: true, 
        messageId: docRef.id,
        provider: 'firebase-extension'
      };

    } catch (error) {
      console.error('❌ Failed to queue participant left email:', error);
      return { 
        success: false, 
        error: error.message,
        provider: 'firebase-extension'
      };
    }
  }

  /**
   * Send room deleted notification
   * @param {Object} roomData - Room information  
   * @param {string} recipientEmail - Email address to send to
   * @param {boolean} isAdmin - Whether this is for admin (different template)
   * @returns {Promise<Object>} Email send result
   */
  async notifyRoomDeleted(roomData, recipientEmail, isAdmin = false) {
    if (!this.emailCollection) {
      console.warn('Firestore not available. Email notification skipped.');
      return { success: false, error: 'Firestore not initialized' };
    }
    
    try {
      const subject = isAdmin
        ? `🔔 Admin Alert: Room ${roomData.roomCode} deleted`
        : `🗑️ Planning Poker Room ${roomData.roomCode} Deleted`;
        
      const emailDoc = {
        to: [recipientEmail],
        message: {
          subject,
          html: this.generateRoomDeletedHTML(roomData, isAdmin),
          text: isAdmin
            ? `Admin Alert: Planning Poker room ${roomData.roomCode} has been deleted by ${roomData.deletedBy}.`
            : `Planning Poker room ${roomData.roomCode} has been deleted by ${roomData.deletedBy}.`
        }
      };

      const docRef = await addDoc(this.emailCollection, emailDoc);
      
      return { 
        success: true, 
        messageId: docRef.id,
        provider: 'firebase-extension'
      };

    } catch (error) {
      console.error('❌ Failed to queue room deleted email:', error);
      return { 
        success: false, 
        error: error.message,
        provider: 'firebase-extension'
      };
    }
  }

  /**
   * Send test email (simplified - no test emails in production)
   * @param {string} recipientEmail - Email to test with
   * @returns {Promise<Object>} Test result
   */
  async sendTestEmail(recipientEmail) {
    const testRoomData = {
      roomCode: 'TEST123',
      hostName: 'Test User',
      hostRole: 'Host & Participant',
      createdAt: Date.now(),
      roomLink: `${this.getOrigin()}/room/TEST123`
    };

    return await this.notifyRoomCreated(testRoomData, recipientEmail);
  }

  /**
   * Generate HTML for room created email
   */
  generateRoomCreatedHTML(roomData, isAdmin = false) {
    const roomLink = `${this.getOrigin()}/room/${roomData.roomCode}`;
    const createdAt = new Date(roomData.createdAt).toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Planning Poker Room Created</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🃏 Planning Poker</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Room Successfully Created!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px;">Hello ${roomData.hostName}! 👋</h2>
            
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Your Planning Poker room has been successfully created and is ready for your team!
            </p>
            
            <!-- Room Details Card -->
            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 30px 0;">
              <h3 style="color: #2d3748; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">📋 Room Details</h3>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #718096; font-weight: 500;">Room Code:</span>
                <span style="color: #2d3748; font-weight: bold; font-size: 18px; margin-left: 8px; font-family: monospace; background: #edf2f7; padding: 4px 8px; border-radius: 4px;">${roomData.roomCode}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #718096; font-weight: 500;">Host:</span>
                <span style="color: #2d3748; margin-left: 8px;">${roomData.hostName}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #718096; font-weight: 500;">Role:</span>
                <span style="color: #2d3748; margin-left: 8px;">${roomData.hostRole || 'Host & Participant'}</span>
              </div>
              
              <div>
                <span style="color: #718096; font-weight: 500;">Created:</span>
                <span style="color: #2d3748; margin-left: 8px;">${createdAt}</span>
              </div>
            </div>
            
            <!-- Join Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${roomLink}" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 16px 32px; 
                        border-radius: 30px; 
                        font-weight: 600; 
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                        transition: all 0.2s ease;">
                🚀 Join Room Now
              </a>
            </div>
            
            <!-- Sharing Instructions -->
            <div style="background-color: #f0f4f8; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h4 style="color: #2d3748; margin: 0 0 12px 0; font-size: 16px;">📤 Share with your team:</h4>
              <ul style="color: #4a5568; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Room Code: <strong>${roomData.roomCode}</strong></li>
                <li>Direct Link: <a href="${roomLink}" style="color: #667eea; text-decoration: none;">${roomLink}</a></li>
                <li>Forward this email to team members</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 12px; margin: 0 0 8px 0;">
              This email was sent because you created a Planning Poker room.
            </p>
            <p style="color: #a0aec0; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} Planning Poker App - Built for better team estimation
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for participant joined email
   */
  generateParticipantJoinedHTML(participantData, isAdmin = false) {
    const roomLink = `${this.getOrigin()}/room/${participantData.roomCode}`;
    const joinedAt = new Date(participantData.joinedAt).toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Participant Joined</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">👋 New Participant Joined</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Room ${participantData.roomCode}</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Great news! Someone new has joined your Planning Poker session.
            </p>
            
            <!-- Participant Info -->
            <div style="background-color: #f0fff4; border-left: 4px solid #48bb78; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 18px;">
                <strong>${participantData.participantName}</strong> 
                <span style="color: #718096; font-size: 14px;">joined as</span>
                <em style="color: #48bb78;">${participantData.participantRole || 'Participant'}</em>
              </p>
              <p style="margin: 0; color: #718096; font-size: 14px;">
                🕐 Joined at ${joinedAt}
              </p>
            </div>
            
            <!-- Back to Room Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${roomLink}" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 24px; 
                        border-radius: 25px; 
                        font-weight: 600; 
                        font-size: 14px;">
                🔙 Return to Room
              </a>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for participant left email
   */
  generateParticipantLeftHTML(participantData, isAdmin = false) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Participant Left Room</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 30px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">👋 Planning Poker</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Participant Left Room</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px;">
              ${participantData.participantName} has left room ${participantData.roomCode}
            </h2>
            
            <div style="background-color: #fed7d7; border-left: 4px solid #f56565; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #742a2a; font-size: 14px;">
                <strong>${participantData.participantName}</strong> is no longer participating in the Planning Poker session.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.getOrigin()}/room/${participantData.roomCode}" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 24px; 
                        border-radius: 25px; 
                        font-weight: 600; 
                        font-size: 14px;">
                📊 Back to Room
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 11px; margin: 0;">
              © 2025 Planning Poker App - Team Collaboration Made Easy
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for room deleted email
   */
  generateRoomDeletedHTML(roomData, isAdmin = false) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Room Deleted</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #a0aec0 0%, #718096 100%); color: white; padding: 30px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🗑️ Planning Poker</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Room Deleted</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 20px;">
              Room ${roomData.roomCode} has been deleted
            </h2>
            
            <div style="background-color: #e2e8f0; border-left: 4px solid #a0aec0; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 14px;">
                <strong>Deleted by:</strong> ${roomData.deletedBy}
              </p>
              <p style="margin: 0; color: #2d3748; font-size: 14px;">
                <strong>Deleted at:</strong> ${new Date(roomData.deletedAt).toLocaleString()}
              </p>
            </div>
            
            <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
              The Planning Poker session has ended. All participant data and voting results have been removed.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.getOrigin()}" 
                 style="display: inline-block; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 12px 24px; 
                        border-radius: 25px; 
                        font-weight: 600; 
                        font-size: 14px;">
                🏠 Create New Room
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #a0aec0; font-size: 11px; margin: 0;">
              © 2025 Planning Poker App - Team Collaboration Made Easy
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  }
}

// Email Preferences Management
export class EmailPreferences {
  static STORAGE_KEY = 'poker_email_preferences';
  
  static DEFAULT_PREFERENCES = {
    roomCreated: true,
    participantJoined: false,
    sessionEnded: false
  };

  static get() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? { ...this.DEFAULT_PREFERENCES, ...JSON.parse(stored) } : this.DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error loading email preferences:', error);
      return this.DEFAULT_PREFERENCES;
    }
  }

  static set(preferences) {
    try {
      const current = this.get();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving email preferences:', error);
    }
  }

  static isEnabled(type) {
    const preferences = this.get();
    return preferences[type] === true;
  }

  static clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing email preferences:', error);
    }
  }
}

// Utility functions
export async function getUserEmail() {
  try {
    return localStorage.getItem('poker_user_email');
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function clearUserEmail() {
  try {
    localStorage.removeItem('poker_user_email');
  } catch (error) {
    console.error('Error clearing user email:', error);
  }
}

// Create and export the email service instance
const emailService = new FirestoreEmailService();
export default emailService;