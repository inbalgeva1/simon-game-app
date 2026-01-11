/**
 * Invite Friends Page
 * 
 * Share game invites and manage friends.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'friends' | 'invite';

export function InvitePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('friends');
  const [copied, setCopied] = useState(false);

  // Generate a shareable invite link
  const inviteLink = `${window.location.origin}/?join=DEMO123`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Simon Says game!',
          text: 'Come play Simon Says with me!',
          url: inviteLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-gray-300 active:scale-95 transition-all p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-white">Invite Friends</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 max-w-md mx-auto w-full">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'friends'
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          👥 Friends
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'invite'
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📨 Invite
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 max-w-md mx-auto w-full">
        {activeTab === 'friends' ? (
          <div className="space-y-4">
            {/* Empty State */}
            <div className="bg-gray-800/80 rounded-xl p-8 border border-gray-700 text-center">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-white font-semibold text-lg mb-2">No friends yet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Invite friends to play Simon Says together!
              </p>
              <button
                onClick={() => setActiveTab('invite')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Send Invite
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Share Link */}
            <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700">
              <p className="text-white font-medium mb-3">Share Invite Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <span>📤</span>
                Share Invite
              </span>
            </button>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                WhatsApp
              </button>
              <button className="bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                Telegram
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

