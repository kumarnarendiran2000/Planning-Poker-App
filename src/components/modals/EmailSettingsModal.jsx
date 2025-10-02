import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { getUserEmail, isValidEmail, EmailPreferences, clearUserEmail } from '../../services/firestoreEmailService';
import enhancedToast from '../../utils/enhancedToast.jsx';

/**
 * Email Settings Modal Component
 * Simple interface for configuring email notifications with Firestore
 */
const EmailSettingsModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    roomCreated: true,
    participantJoined: false,
    sessionEnded: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCurrentSettings();
    }
  }, [isOpen]);

  const loadCurrentSettings = async () => {
    try {
      const currentEmail = await getUserEmail();
      const currentPreferences = EmailPreferences.get();
      
      setEmail(currentEmail || '');
      setPreferences(currentPreferences);
    } catch (error) {
      console.error('Error loading email settings:', error);
    }
  };

  const handleSave = async () => {
    if (!email.trim()) {
      enhancedToast.error('Please enter an email address');
      return;
    }

    if (!isValidEmail(email)) {
      enhancedToast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save email to localStorage
      localStorage.setItem('poker_user_email', email.trim());
      
      // Save preferences
      EmailPreferences.set(preferences);
      
      enhancedToast.success('✅ Email settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving email settings:', error);
      enhancedToast.error('❌ Failed to save email settings');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmail = async () => {
    if (!email || !isValidEmail(email)) {
      enhancedToast.error('Please enter a valid email address first');
      return;
    }

    setIsLoading(true);
    
    try {
      // Import email service dynamically
      const { default: emailService } = await import('../../services/firestoreEmailService');
      
      const result = await emailService.sendTestEmail(email);
      
      if (result.success) {
        enhancedToast.success('🎉 Test email queued! Check your inbox in a moment.');
      } else {
        enhancedToast.error(`❌ Test email failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test email error:', error);
      enhancedToast.error('❌ Failed to send test email. Make sure Firebase Extension is installed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📧 Email Notifications"
      showCancel={true}
      showOk={true}
      okText={isLoading ? 'Saving...' : 'Save Settings'}
      onOk={handleSave}
      type="default"
    >
      <div className="py-4 space-y-6">
        {/* Email Address Section */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            📬 We'll send notifications via Firebase Extension
          </p>
        </div>

        {/* Test Email Button */}
        <div>
          <button
            type="button"
            onClick={testEmail}
            disabled={!email || isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '📤 Sending...' : '🧪 Send Test Email'}
          </button>
          <p className="mt-1 text-xs text-gray-500 text-center">
            This will queue a test email in Firestore
          </p>
        </div>

        {/* Email Preferences */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">📋 Notification Types</h3>
          <div className="space-y-3">
            {/* Room Created */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">🃏 Room Created</label>
                <p className="text-xs text-gray-500">Get notified when you create a new room</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.roomCreated}
                  onChange={(e) => setPreferences(prev => ({ ...prev, roomCreated: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Participant Joined */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">👋 Participant Joined</label>
                <p className="text-xs text-gray-500">Get notified when someone joins your room</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.participantJoined}
                  onChange={(e) => setPreferences(prev => ({ ...prev, participantJoined: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Session Ended */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">📊 Session Ended</label>
                <p className="text-xs text-gray-500">Get a summary when sessions end</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.sessionEnded}
                  onChange={(e) => setPreferences(prev => ({ ...prev, sessionEnded: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Clear Email Button */}
        {email && (
          <div>
            <button
              type="button"
              onClick={() => {
                clearUserEmail();
                setEmail('');
                enhancedToast.info('📧 Email address cleared');
              }}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              🗑️ Clear Email Address
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-800">
                <strong>🔥 Firebase Extension:</strong> Emails are sent via Firebase "Trigger Email" extension. 
                Make sure it's installed and configured in your Firebase Console.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmailSettingsModal;