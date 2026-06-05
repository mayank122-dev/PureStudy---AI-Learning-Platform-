import React, { useState, useEffect } from 'react';
import { Smartphone, Download } from 'lucide-react';

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) {
    return (
      <div className="w-full flex items-center justify-between p-4 bg-[#131825] border border-gray-800 rounded-xl">
         <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <div>
               <span className="text-sm font-bold text-gray-400">Install App</span>
               <p className="text-xs text-gray-500 mt-0.5">App is already installed or not supported on this browser.</p>
            </div>
         </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleInstallClick}
      className="w-full flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl transition-colors group cursor-pointer"
    >
       <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <div className="text-left">
             <span className="text-sm font-bold text-indigo-400">Install as App (APK via PWA)</span>
             <p className="text-xs text-indigo-500/70 mt-0.5">Add to your home screen for native experience</p>
          </div>
       </div>
       <Download className="w-4 h-4 text-indigo-400/50" />
    </button>
  );
}
