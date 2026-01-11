import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-3 text-white">
            {icon}
            <h2 className="text-xl font-bold font-mono">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
            aria-label="Close Modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto text-slate-300 space-y-4 text-sm leading-relaxed">
          {children}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface LegalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalProps> = ({ type, onClose }) => {
  return (
    <>
      <Modal 
        isOpen={type === 'privacy'} 
        onClose={onClose}
        title="Privacy Policy"
        icon={<Shield className="text-emerald-400" />}
      >
        <p><strong>Last Updated: October 2025</strong></p>
        <p>
          Welcome to Load Balancer Pro. This Privacy Policy explains how we handle your information.
        </p>
        <h3 className="text-white font-bold mt-4">1. Data Collection</h3>
        <p>
          We do not collect any personal identifiable information (PII) on our servers. This application is a client-side browser game. 
        </p>
        <h3 className="text-white font-bold mt-4">2. Local Storage</h3>
        <p>
          We use your browser's Local Storage to save your high score and game preferences locally on your device. This data is not transmitted to us.
        </p>
        <h3 className="text-white font-bold mt-4">3. Analytics</h3>
        <p>
          We may use anonymous aggregate analytics to understand gameplay patterns and improve the experience.
        </p>
      </Modal>

      <Modal 
        isOpen={type === 'terms'} 
        onClose={onClose}
        title="Terms of Service"
        icon={<FileText className="text-sky-400" />}
      >
         <p><strong>Last Updated: October 2025</strong></p>
         <p>
           By accessing Load Balancer Pro, you agree to these Terms of Service.
         </p>
         <h3 className="text-white font-bold mt-4">1. License</h3>
         <p>
           Load Balancer Pro is provided free of charge for personal entertainment. You may not reverse engineer, redistribute, or sell this software without explicit permission.
         </p>
         <h3 className="text-white font-bold mt-4">2. Disclaimer</h3>
         <p>
           The software is provided "as is", without warranty of any kind. We are not responsible for any issues that may arise from the use of this software.
         </p>
         <h3 className="text-white font-bold mt-4">3. Updates</h3>
         <p>
           We reserve the right to modify the game mechanics, scoring system, or these terms at any time.
         </p>
      </Modal>
    </>
  );
};