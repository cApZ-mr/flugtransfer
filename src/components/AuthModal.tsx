import React, { useState } from 'react';
import { useRoster } from '../context/RosterContext';
import { 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  X
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useRoster();

  // Profile Form
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [base, setBase] = useState(currentUser.base);
  const [airline, setAirline] = useState(currentUser.airline || 'Lufthansa Group');
  const [employeeNumber, setEmployeeNumber] = useState(currentUser.employeeNumber);
  const [email, setEmail] = useState(currentUser.email);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    updateUserProfile({
      name: name.trim(),
      role,
      base,
      airline: airline.trim(),
      employeeNumber: employeeNumber.trim(),
      email: email.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D121F] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Flugtransfer Profil</h2>
            <p className="text-xs text-slate-400">Dein Crew-Account für den Dienstplan</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Rolle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Kapitän">Kapitän</option>
                <option value="First Officer">First Officer</option>
                <option value="Purser 1">Purser 1</option>
                <option value="Flugbegleiter">Flugbegleiter</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Basis</label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value as any)}
                className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-mono"
              >
                <option value="FRA">FRA</option>
                <option value="MUC">MUC</option>
                <option value="DUS">DUS</option>
                <option value="BER">BER</option>
                <option value="HAM">HAM</option>
                <option value="ZRH">ZRH</option>
                <option value="VIE">VIE</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Airline</label>
            <input
              type="text"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Crew ID</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">E-Mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#050811] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Profil aktualisieren
          </button>
        </form>

      </div>
    </div>
  );
};
