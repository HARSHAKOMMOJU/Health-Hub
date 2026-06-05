import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Heart,
  Shield, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

const slideIn  = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };
const transition = { duration: 0.25, ease: 'easeOut' };
const STEP_LABELS = ['Account', 'Security', 'Details'];

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep]         = useState(1);
  const [showPw, setShowPw]     = useState(false);
  const [showCpw, setShowCpw]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '', address: '',
    city: '', state: '', zipCode: ''
  });
  const [errors, setErrors] = useState({});

  const set = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
  }, []);

  const validate = () => {
    const e = {};
    if (isSignUp) {
      if (step === 1) {
        if (!form.firstName) e.firstName = 'Required';
        if (!form.lastName)  e.lastName  = 'Required';
        if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      } else if (step === 2) {
        if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(form.password))
          e.password = 'Needs uppercase, lowercase & number';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      } else if (step === 3) {
        if (!form.phone)   e.phone   = 'Required';
        if (!form.address) e.address = 'Required';
      }
    } else {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next  = () => { if (validate()) setStep(s => s + 1); };
  const back  = () => setStep(s => s - 1);

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const phone = form.phone.startsWith('+') ? form.phone : '+91' + form.phone;
        const result = await register({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, password: form.password,
          phoneNumber: phone,
          dateOfBirth: new Date('1990-01-01').toISOString(),
          gender: 'other', bloodGroup: 'O+',
          address: { street: form.address || '123 Main St', city: form.city || 'City',
            state: form.state || 'State', zipCode: form.zipCode || '00000', country: 'India' },
          emergencyContact: { name: `${form.firstName} ${form.lastName}`,
            relationship: 'Self', phoneNumber: phone },
        });
        if (result.success) navigate('/dashboard');
      } else {
        const result = await login({ email: form.email, password: form.password });
        if (result.success) navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(v => !v); setErrors({}); setStep(1);
    setForm({ email:'', password:'', confirmPassword:'', firstName:'',
      lastName:'', phone:'', address:'', city:'', state:'', zipCode:'' });
  };

  const StepIndicator = () => (
    <div className={styles.stepIndicator}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done   = step > n;
        return (
          <React.Fragment key={n}>
            {i > 0 && <div className={`${styles.stepLine} ${done ? styles.done : ''}`} />}
            <div className={`${styles.stepDot} ${active ? styles.active : ''} ${done ? styles.done : ''}`}>
              {done ? <CheckCircle size={13} /> : n}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  const headerTitles    = ['Create account', 'Set your password', 'Almost done!'];
  const headerSubtitles = [
    'Start your health journey with HealthHub.',
    'Choose a strong password to protect your account.',
    'Just a few more details to complete your profile.',
  ];

  return (
    <div className={styles.page}>
      {/* ambient background */}
      <div className={styles.orbTop} />
      <div className={styles.orbBottom} />
      <div className={styles.bgGrid} />

      <div className={styles.centerWrap}>

        {/* Logo */}
        <motion.div
          className={styles.logo}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className={styles.logoIcon}><Heart size={18} /></div>
          <span className={styles.logoText}>HealthHub</span>
        </motion.div>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className={styles.eyebrow}>
            {isSignUp ? `Step ${step} of 3` : 'Secure Sign In'}
          </div>
          <h1 className={styles.title}>
            {isSignUp ? headerTitles[step - 1] : 'Welcome back'}
          </h1>
          <p className={styles.subtitle}>
            {isSignUp
              ? headerSubtitles[step - 1]
              : 'Sign in to access your personal health portal.'}
          </p>
        </motion.div>

        {/* Step dots */}
        {isSignUp && <StepIndicator />}

        {/* Card */}
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <form onSubmit={submit} noValidate>
            <AnimatePresence mode="wait">

              {/* LOGIN */}
              {!isSignUp && (
                <motion.div key="login" variants={slideIn} initial="hidden" animate="visible" exit="exit" transition={transition}>
                  <Field name="email" label="Email address" value={form.email} onChange={set} error={errors.email} icon={<Mail size={15}/>} styles={styles} />
                  <Field name="password" type={showPw ? 'text' : 'password'} label="Password" value={form.password} onChange={set} error={errors.password} icon={<Lock size={15}/>} styles={styles}
                    right={<button type="button" onClick={() => setShowPw(v => !v)} className={styles.iconRight}>{showPw ? <EyeOff size={15}/> : <Eye size={15}/>}</button>}
                  />
                  <button type="submit" disabled={loading} className={`${styles.btnPrimary} ${styles.btnFull}`}>
                    {loading ? <span className={styles.spinner} /> : 'Sign In →'}
                  </button>
                </motion.div>
              )}

              {/* STEP 1 */}
              {isSignUp && step === 1 && (
                <motion.div key="s1" variants={slideIn} initial="hidden" animate="visible" exit="exit" transition={transition}>
                  <div className={styles.grid2}>
                    <Field name="firstName" label="First name" value={form.firstName} onChange={set} error={errors.firstName} icon={<User size={15}/>} styles={styles} />
                    <Field name="lastName"  label="Last name"  value={form.lastName}  onChange={set} error={errors.lastName}  styles={styles} />
                  </div>
                  <Field name="email" label="Email address" value={form.email} onChange={set} error={errors.email} icon={<Mail size={15}/>} styles={styles} />
                  <button type="button" onClick={next} className={`${styles.btnPrimary} ${styles.btnFull}`}>Continue →</button>
                </motion.div>
              )}

              {/* STEP 2 */}
              {isSignUp && step === 2 && (
                <motion.div key="s2" variants={slideIn} initial="hidden" animate="visible" exit="exit" transition={transition}>
                  <Field name="password" type={showPw ? 'text' : 'password'} label="Password" value={form.password} onChange={set} error={errors.password} icon={<Lock size={15}/>} styles={styles}
                    right={<button type="button" onClick={() => setShowPw(v => !v)} className={styles.iconRight}>{showPw ? <EyeOff size={15}/> : <Eye size={15}/>}</button>}
                  />
                  <Field name="confirmPassword" type={showCpw ? 'text' : 'password'} label="Confirm password" value={form.confirmPassword} onChange={set} error={errors.confirmPassword} icon={<Lock size={15}/>} styles={styles}
                    right={<button type="button" onClick={() => setShowCpw(v => !v)} className={styles.iconRight}>{showCpw ? <EyeOff size={15}/> : <Eye size={15}/>}</button>}
                  />
                  <div className={styles.actions}>
                    <button type="button" onClick={back} className={styles.btnSecondary}>← Back</button>
                    <button type="button" onClick={next} className={styles.btnPrimary}>Continue →</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {isSignUp && step === 3 && (
                <motion.div key="s3" variants={slideIn} initial="hidden" animate="visible" exit="exit" transition={transition}>
                  <Field name="phone"   type="tel" label="Phone number"  value={form.phone}   onChange={set} error={errors.phone}   icon={<Phone  size={15}/>} styles={styles} />
                  <Field name="address"            label="Street address" value={form.address} onChange={set} error={errors.address} icon={<MapPin size={15}/>} styles={styles} />
                  <div className={styles.actions}>
                    <button type="button" onClick={back} className={styles.btnSecondary}>← Back</button>
                    <button type="submit" disabled={loading} className={styles.btnPrimary}>
                      {loading ? <span className={styles.spinner} /> : 'Create Account ✓'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>

          <p className={styles.toggleRow}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={toggleMode} className={styles.toggleBtn}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>

        {/* Trust badges */}
        <div className={styles.trust}>
          {['SSL Secured', 'HIPAA Compliant', 'No spam ever'].map((t, i) => (
            <span key={i} className={styles.trustBadge}>
              <Shield size={10} /> {t}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
};

/* Reusable Field */
const Field = ({ label, name, type = 'text', value, onChange, error, icon, right, styles }) => {
  const cls = [
    styles.input,
    icon  ? styles.hasIconLeft  : '',
    right ? styles.hasIconRight : '',
    error ? styles.inputError   : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.fieldLabel}>{label}</label>
      <div className={styles.fieldWrap}>
        {icon  && <span className={styles.iconLeft}>{icon}</span>}
        <input
          id={name} name={name} type={type}
          value={value} onChange={onChange}
          placeholder={type === 'password' ? '••••••••' : ''}
          className={cls}
          autoComplete={type === 'password' ? 'current-password' : name}
        />
        {right}
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
};

export default AuthPage;