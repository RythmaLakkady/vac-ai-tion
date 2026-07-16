<<<<<<< HEAD
import React, { useState } from 'react';
=======
import { useState } from 'react';
>>>>>>> c46005a (Initialize WanderGen trip planner)
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from 'sonner';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");  

        try {
<<<<<<< HEAD
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
=======
            await signInWithEmailAndPassword(auth, email, password);
>>>>>>> c46005a (Initialize WanderGen trip planner)

            toast("Logged in successfully!");
            navigate('/');  
        } catch (err) {
            toast("Error logging in");
            setError(err.message);  
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <div className='w-1/3 h-[500px] p-10 border rounded-lg shadow-lg shadow-[#7AB9B3] flex flex-col justify-center'>
                <h2 className='text-3xl font-serif font-semibold text-[#7AB9B3] my-7 text-center'>Log in to continue your journey!</h2>
                
                {error && <div className="text-red-600 text-center mb-4">{error}</div>}

                <form onSubmit={onSubmit}>
                    <div>
                        <label className='font-serif text-xl'> Email: </label>
                        <Input
                            className='text-center mt-2'
                            type="email"
                            placeholder="Enter your email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='mt-8'>
                        <label className='font-serif text-xl'> Password: </label>
                        <Input
                            className='text-center mt-2'
                            type="password"
                            placeholder="Enter your password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className='mt-10 flex flex-col items-center'>
                        <Button className="py-2 px-6 bg-[#7AB9B3] text-white rounded hover:bg-[#66a19b]" type="submit">
                            Log In
                        </Button>
                    </div>
                    <p className='mt-5 flex flex-col items-center font-serif'>
                        New user?
                        <strong>
                            <Link to={'/signIn'} className='text-[#fd9c7e] font-semibold underline hover:text-[#db7e62]'>
                                Sign up
                            </Link>
                        </strong>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
