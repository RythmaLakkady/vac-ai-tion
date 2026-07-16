import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';  
import { createUserWithEmailAndPassword } from "firebase/auth";  
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Mail, Lock } from 'lucide-react';

function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long!");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            toast.success("Account created successfully!");
            navigate('/');
        } catch (err) {
            console.error("Signup error:", err);
            if (err.code === 'auth/email-already-in-use') {
                toast.error("This email is already in use. Try logging in!");
            } else if (err.code === 'auth/invalid-email') {
                toast.error("Invalid email address.");
            } else if (err.code === 'auth/weak-password') {
                toast.error("Password is too weak. Please use a stronger password.");
            } else {
                toast.error(err.message || "An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden'>
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-holiday-teal/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='w-full max-w-md p-10 bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl z-10'
            >
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-holiday-teal/10 rounded-2xl flex items-center justify-center">
                        <PlaneTakeoff className="w-8 h-8 text-holiday-teal" />
                    </div>
                </div>

                <h2 className='text-3xl font-bold text-slate-800 text-center mb-2'>Join the Journey!</h2>
                <p className="text-center text-slate-500 mb-8">Create your account and start exploring</p>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className='text-sm font-medium text-slate-700 ml-1'> Email </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                className='pl-10 py-6 bg-white/50 border-slate-200 focus-visible:ring-holiday-teal'
                                type="email"
                                placeholder="Enter your email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className='text-sm font-medium text-slate-700 ml-1'> Password </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                className='pl-10 py-6 bg-white/50 border-slate-200 focus-visible:ring-holiday-teal'
                                type="password"
                                placeholder="Create a password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button className="w-full py-6 mt-4 bg-holiday-teal text-white rounded-xl hover:bg-holiday-teal/90 shadow-lg shadow-holiday-teal/20 transition-all text-lg font-medium" type="submit">
                        Sign Up
                    </Button>

                    <p className='mt-8 text-center text-slate-500'>
                        Already a member?{' '}
                        <Link to={'/login'} className='text-holiday-teal font-semibold hover:underline transition-all'>
                            Log in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}

export default SignUpForm;
