import React, { useState } from 'react';
import { LoadBalancerGame } from './components/LoadBalancerGame';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LegalModals } from './components/LegalModals';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <ErrorBoundary>
      {/* using h-[100dvh] ensures full viewport height on mobile browsers including address bar accounting */}
      <div className="w-full h-[100dvh] bg-slate-900 text-white overflow-hidden relative">
        {isPlaying ? (
          <LoadBalancerGame onBack={() => setIsPlaying(false)} />
        ) : (
          <div className="h-full overflow-y-auto">
             <LandingPage 
               onStart={() => setIsPlaying(true)} 
               onOpenPrivacy={() => setLegalModal('privacy')}
               onOpenTerms={() => setLegalModal('terms')}
             />
          </div>
        )}
        
        <LegalModals 
          type={legalModal} 
          onClose={() => setLegalModal(null)} 
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;