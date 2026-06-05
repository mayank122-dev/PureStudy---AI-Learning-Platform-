import React, { useState } from 'react';
import { X, Send, Link as LinkIcon, Twitter, MessageCircle } from 'lucide-react';

interface ShareProfileModalProps {
  username: string;
  onClose: () => void;
}

export default function ShareProfileModal({ username, onClose }: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}?user=${encodeURIComponent(username)}`;
  const shareText = `Check out ${username}'s profile on PureStudy!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: 'PureStudy Profile',
      text: shareText,
      url: shareUrl
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error with native share', err);
      }
    }
  };

  const isNativeShareSupported = !!(navigator.share);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#131825] border border-gray-800 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-800/60 pb-5">
           <h3 className="text-xl font-black text-white">Share Profile</h3>
           <button onClick={onClose} className="p-2 bg-[#1A2235] hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex bg-[#1A2235] p-1 rounded-2xl border border-gray-800/80 mb-2">
            <input 
              type="text" 
              readOnly 
              value={shareUrl} 
              className="w-full bg-transparent text-gray-400 text-sm px-3 outline-none truncate"
            />
            <button 
              onClick={handleCopyLink}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
            >
              <LinkIcon className="w-4 h-4" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
             <button onClick={handleWhatsApp} className="flex flex-col items-center justify-center p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-2xl transition-colors group">
                <MessageCircle className="w-8 h-8 text-[#25D366] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-[#25D366]">WhatsApp</span>
             </button>
             
             <button onClick={handleTelegram} className="flex flex-col items-center justify-center p-4 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 rounded-2xl transition-colors group">
                <Send className="w-8 h-8 text-[#0088cc] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-[#0088cc]">Telegram</span>
             </button>

             <button onClick={handleTwitter} className="flex flex-col items-center justify-center p-4 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 rounded-2xl transition-colors group">
                <Twitter className="w-8 h-8 text-[#1DA1F2] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-[#1DA1F2]">Twitter</span>
             </button>
          </div>

          {isNativeShareSupported && (
            <button 
              onClick={handleNativeShare}
              className="w-full mt-2 py-3 bg-[#1A2235] hover:bg-gray-800 border border-gray-700 rounded-2xl text-white font-bold text-sm transition-colors flex justify-center items-center gap-2"
            >
              More Options
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
