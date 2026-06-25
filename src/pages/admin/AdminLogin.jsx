import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { ShieldCheck, Lock, Mail, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminGatePassSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      
      const res = await axiosInstance.post('/cms/admin-gate-login', { email, password });
      
      if (res.data?.success && res.data?.token) {
        // Lock secure administrative clearance token inside local storage
        localStorage.setItem('adm_tk', res.data.token);
        // Direct redirect execution to master control terminal desk
        navigate('/admin/cms-control');
      } else {
        setError(res.data?.message || 'Handshake rejected by cloud systems.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network node handshake verification failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f4ef] text-[#1a1a1a] font-['DM_Sans'] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-[#e8e2d8] p-8 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] text-left flex flex-col gap-6">
        
        <div className="text-center flex flex-col items-center gap-1.5 select-none">
          <div className="w-10 h-10 rounded-full bg-[#b5862a]/10 flex items-center justify-center text-[#b5862a] mb-2">
            <Lock size={18} />
          </div>
          <span className="text-[0.62rem] tracking-[0.4em] uppercase text-[#b5862a] font-bold">Secure Gateway Access</span>
          <h2 className="font-['Playfair_Display'] text-2xl font-normal text-neutral-800">Hidden Core Terminal</h2>
        </div>

        {error && (
          <div className="w-full p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-md flex items-center gap-2 font-medium">
            <AlertCircle size={14} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleAdminGatePassSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1"><Mail size={10} /> Email Registry Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., admin@brand.com"
              className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1"><Lock size={10} /> Administrative Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-50 border border-neutral-200 p-3 text-sm rounded-md focus:outline-none focus:border-[#b5862a] text-[#1a1a1a]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#1a1a1a] text-white py-3.5 text-xs font-bold tracking-[0.25em] uppercase rounded-md shadow-md hover:bg-[#b5862a] transition-colors duration-400 flex justify-center items-center gap-2 disabled:bg-neutral-400"
          >
            {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
            {isSubmitting ? 'Authenticating Gate...' : 'Validate & Enter'}
          </button>
        </form>

        <p className="text-[10px] text-neutral-400 text-center font-light tracking-wide mt-2">
          Unauthorized parameter interception tracks are logged onto server master logs automatically.
        </p>
      </div>
    </div>
  );
}
