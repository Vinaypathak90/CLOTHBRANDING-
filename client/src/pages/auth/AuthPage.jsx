import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function AuthPage() {
  const { loginUser, registerUser, requestRegistrationOtp, syncGoogleUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // SEAMLESS REDIRECT LOGIC: User jahan se aaya tha, wahin wapas jayega.
  const from = location.state?.from?.pathname || '/';

  // Navigation States: 'login' | 'register' | 'register-otp' | 'forgot' | 'otp'
  const [view, setView] = useState('login');
  
  // Form Data State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', otp: '', newPassword: ''
  });
  
  // Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors on typing
  };

  // ====================================================================
  // 🔥 Programmatic Google Popup Handler (Optimized & Cleaned)
  // ====================================================================
  const triggerGoogleOAuthSync = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true); setError(''); setSuccess('');
        console.log("⚡ [OAUTH HANDSHAKE]: Authentication successful! Extracting profile info...");
        
        // 1. Native fetch layer to bypass any axios instance/base-url configuration confusion
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        
        const profileData = await response.json();
        console.log("👤 [GOOGLE DATA RECEIVED]:", profileData);

        const { sub, email, name, picture } = profileData;

        // 2. Continuous session handshake with your internal context database manager
        console.log("🔄 [DATABASE SYNC]: Pushing token parameters into backend identity clusters...");
        await syncGoogleUser(sub, email, name, picture);

        // 3. Direct seamless routing bypasses any strict return status validations
        console.log("🚀 [ROUTING ACTION]: Transferring customer session tokens to target:", from);
        navigate(from, { replace: true });

      } catch (err) {
        console.error("❌ [HANDSHAKE ERROR EXCEPTION]:", err);
        setError('Google identity integration sync failed inside profile extraction parser.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google identity authorization terminal rejected.'),
  });

  // ====================================================================
  // 1. LOGIN PIPELINE
  // ====================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await loginUser(formData.email, formData.password, 'shop');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 2. REGISTRATION PIPELINE - STEP 1 (REQUEST OTP)
  // ====================================================================
  const handleSignupRequest = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await requestRegistrationOtp(formData.email);
      // Backend automatically sends OTP to email securely, we just move to the next screen
      if (res.success) {
        setSuccess(`Registration OTP sent to ${formData.email}.`);
        setView('register-otp');
      }
    } catch (err) {
      setError(err || 'Failed to initiate registration.');
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 3. REGISTRATION PIPELINE - STEP 2 (VERIFY & CREATE)
  // ====================================================================
  const handleSignupVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    
    try {
      // Passes OTP to backend via context so the backend verifies it securely
      await registerUser(formData.name, formData.email, formData.password, formData.otp);
      navigate(from, { replace: true }); 
    } catch (err) {
      setError(err || 'Registration failed or invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // 4. FORGOT PASSWORD PIPELINES
  // ====================================================================
  const handleRequestPasswordOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email: formData.email });
      if (res.data.success) {
        setSuccess(`Password reset OTP sent to ${formData.email}.`);
        setView('otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await axiosInstance.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      if (res.data.success) {
        setSuccess('Password reset successfully. You can now log in.');
        setTimeout(() => setView('login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f7f4ef] font-['DM_Sans'] text-[#1a1a1a]">
      
      {/* LEFT CANVAS: Luxury Editorial Image (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#e8e4dc] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80" 
          alt="Luxury Fashion" 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-16 z-10 text-white">
          <h2 className="font-['Playfair_Display'] text-5xl tracking-wide font-normal mb-4">
            Embrace the <br/><span className="text-[#b5862a] italic">Elegance.</span>
          </h2>
          <p className="text-sm font-light tracking-[0.2em] uppercase opacity-80">Preeti Clothing / Est. 2024</p>
        </div>
      </div>

      {/* RIGHT CANVAS: Authentication Workspace */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative">
        
        {/* Top Right Floating Back to Store Link */}
        <button 
          onClick={() => navigate(from)}
          className="absolute top-10 right-10 text-[0.7rem] tracking-[0.2em] font-bold uppercase text-neutral-400 hover:text-[#b5862a] transition-colors"
        >
          Return Back
        </button>

        <div className="w-full max-w-md">
          
          {/* Header Switcher */}
          <div className="mb-10 text-center">
            {view === 'login' && <h1 className="text-3xl font-['Playfair_Display'] mb-2">Welcome Back</h1>}
            {view.includes('register') && <h1 className="text-3xl font-['Playfair_Display'] mb-2">Join the Lineage</h1>}
            {(view === 'forgot' || view === 'otp') && <h1 className="text-3xl font-['Playfair_Display'] mb-2">Account Recovery</h1>}
            <div className="w-12 h-[1px] bg-[#b5862a] mx-auto mt-4 mb-6"></div>
            <p className="text-[0.85rem] text-neutral-500 font-light tracking-wide">
              {view === 'login' ? 'Enter your details to access your curation board.' : 
               view.includes('register') ? 'Sign up for exclusive high-fashion access.' : 
               'Follow the steps to regain access to your account.'}
            </p>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded flex items-start gap-3 text-red-600 text-[0.85rem]">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50/50 border border-green-100 rounded flex items-start gap-3 text-green-700 text-[0.85rem]">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* ================================================== */}
          {/* LOGIN FORM */}
          {/* ================================================== */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="relative">
                <Mail size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="email" name="email" required placeholder="Email Address"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>
              <div className="relative mt-2">
                <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="password" name="password" required placeholder="Password"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>

              <div className="flex justify-end mt-1">
                <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} className="text-[0.75rem] text-neutral-500 hover:text-[#b5862a] transition-colors">
                  Forgot your password?
                </button>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#1a1a1a] text-white py-4 mt-4 text-[0.75rem] font-bold tracking-[0.25em] uppercase hover:bg-[#b5862a] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={14} />
              </button>

              <div className="relative flex items-center justify-center mt-6 mb-2">
                <span className="absolute bg-[#f7f4ef] px-4 text-[0.7rem] uppercase tracking-widest text-neutral-400 z-10">Or</span>
                <div className="w-full h-[1px] bg-neutral-200"></div>
              </div>

              <div className="w-full">
                <button 
                  type="button" 
                  onClick={() => triggerGoogleOAuthSync()} 
                  disabled={loading}
                  className="w-full border border-neutral-300 bg-white text-[#1a1a1a] py-3.5 text-[0.8rem] font-medium tracking-wide hover:bg-neutral-50 transition-colors flex justify-center items-center gap-3 disabled:opacity-50"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                  Continue with Google
                </button>
              </div>

              <p className="text-center text-[0.85rem] text-neutral-500 mt-6">
                Don't have an account? <button type="button" onClick={() => { setView('register'); setError(''); setSuccess(''); }} className="text-[#1a1a1a] font-semibold hover:text-[#b5862a] underline underline-offset-4">Sign Up</button>
              </p>
            </form>
          )}

          {/* ================================================== */}
          {/* REGISTRATION FORM (STEP 1 - REQUEST OTP) */}
          {/* ================================================== */}
          {view === 'register' && (
            <form onSubmit={handleSignupRequest} className="flex flex-col gap-5">
              <div className="relative">
                <User size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" name="name" required placeholder="Full Name"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>
              <div className="relative mt-2">
                <Mail size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="email" name="email" required placeholder="Email Address"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>
              <div className="relative mt-2">
                <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="password" name="password" required placeholder="Create Password"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#1a1a1a] text-white py-4 mt-6 text-[0.75rem] font-bold tracking-[0.25em] uppercase hover:bg-[#b5862a] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Next: Verify Email'} <ArrowRight size={14} />
              </button>

              <p className="text-center text-[0.85rem] text-neutral-500 mt-6">
                Already part of the lineage? <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} className="text-[#1a1a1a] font-semibold hover:text-[#b5862a] underline underline-offset-4">Sign In</button>
              </p>
            </form>
          )}

          {/* ================================================== */}
          {/* REGISTRATION FORM (STEP 2 - VERIFY OTP) */}
          {/* ================================================== */}
          {view === 'register-otp' && (
            <form onSubmit={handleSignupVerify} className="flex flex-col gap-5">
              <p className="text-[0.8rem] text-[#b5862a] font-bold uppercase mb-2">Verifying: {formData.email}</p>
              
              <div className="relative">
                <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" name="otp" required placeholder="Enter 6-Digit OTP" maxLength="6"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors tracking-[0.5em] font-bold"
                />
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#1a1a1a] text-white py-4 mt-4 text-[0.75rem] font-bold tracking-[0.25em] uppercase hover:bg-[#b5862a] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Verify & Create Account'} <ArrowRight size={14} />
              </button>

              <button type="button" onClick={() => setView('register')} className="flex items-center justify-center gap-1 text-[0.75rem] text-neutral-500 mt-4 hover:text-[#1a1a1a]">
                <ChevronLeft size={14} /> Back to details
              </button>
            </form>
          )}

          {/* ================================================== */}
          {/* FORGOT PASSWORD - STEP 1 (REQUEST OTP) */}
          {/* ================================================== */}
          {view === 'forgot' && (
            <form onSubmit={handleRequestPasswordOTP} className="flex flex-col gap-5">
              <div className="relative">
                <Mail size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="email" name="email" required placeholder="Registered Email Address"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#b5862a] text-white py-4 mt-4 text-[0.75rem] font-bold tracking-[0.25em] uppercase hover:bg-[#9c711f] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Recovery OTP'} <ArrowRight size={14} />
              </button>
              
              <button type="button" onClick={() => setView('login')} className="flex items-center justify-center gap-1 text-[0.75rem] text-neutral-500 mt-4 hover:text-[#1a1a1a]">
                <ChevronLeft size={14} /> Back to Login
              </button>
            </form>
          )}

          {/* ================================================== */}
          {/* FORGOT PASSWORD - STEP 2 (ENTER OTP & NEW PASS) */}
          {/* ================================================== */}
          {view === 'otp' && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <p className="text-[0.8rem] text-[#b5862a] font-bold tracking-wider uppercase mb-2">Email: {formData.email}</p>
              
              <div className="relative">
                <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" name="otp" required placeholder="Enter 6-Digit OTP" maxLength="6"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors tracking-[0.5em] font-bold"
                />
              </div>
              
              <div className="relative mt-2">
                <Lock size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="password" name="newPassword" required placeholder="Enter New Password"
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-neutral-300 py-3 pl-8 text-[0.9rem] focus:outline-none focus:border-[#b5862a] transition-colors"
                />
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[#1a1a1a] text-white py-4 mt-6 text-[0.75rem] font-bold tracking-[0.25em] uppercase hover:bg-[#b5862a] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Reset Secure Access'} <ArrowRight size={14} />
              </button>

              <button type="button" onClick={() => setView('login')} className="flex items-center justify-center gap-1 text-[0.75rem] text-neutral-500 mt-4 hover:text-[#1a1a1a]">
                <ChevronLeft size={14} /> Cancel Recovery
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}