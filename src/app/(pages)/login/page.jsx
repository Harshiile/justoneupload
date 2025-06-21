"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomButton } from '@/components/CustomButton'
import { toast } from "sonner";

import { useEffect, useState } from 'react';
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion';
import { AsyncFetcher } from '@/lib/fetcher';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/store/user'


const CheckMessage = ({ condition, message }) => (
    <div className='flex items-center gap-x-2 text-sm'>
        <span
            className={`w-4 h-4 flex items-center justify-center rounded-full border-2 ${condition ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'
                }`}
        >
            {condition ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3">
                    <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </span>
        <span
            className={`${condition ? 'text-green-400' : 'text-red-400'
                }`}
        >
            {message}
        </span>
    </div>
);


const Login = () => {
    const user = useUser(state => state.user);
    const setUser = useUser(state => state.setUser);

    const navigate = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');


    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw] px-6 py-8 border border-[#27272a] rounded-2xl bg-[#09090b] text-white shadow-2xl mx-auto'
        >
            <div className='w-full flex flex-col gap-y-6'>
                {/* Heading */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='text-xl sm:text-2xl md:text-3xl font-bold text-center'
                >
                    {isLogin ? 'Log In' : 'Sign Up'}
                </motion.p>

                {/* Email */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='flex flex-col items-start gap-y-2'
                >
                    <Label htmlFor='email' className='text-base sm:text-md'>Email</Label>
                    <Input
                        id='email'
                        className='w-full border border-[#27272a] bg-transparent text-md px-3 py-2 focus-visible:ring-1 focus-visible:ring-blue-500 transition'
                        placeholder='example@gmail.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </motion.div>

                {/* Name */}
                <AnimatePresence>
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className='flex flex-col items-start gap-y-2 overflow-hidden'
                        >
                            <Label htmlFor='name' className='text-base sm:text-md'>Name</Label>
                            <Input
                                id='name'
                                className='w-full border border-[#27272a] bg-transparent text-md px-3 py-2 focus-visible:ring-1 focus-visible:ring-blue-500 transition'
                                placeholder='John Doe'
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Password */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='flex flex-col items-start gap-y-2'
                >
                    <Label htmlFor='password' className='text-base sm:text-md'>Password</Label>
                    <Input
                        id='password'
                        type="password"
                        className='w-full border border-[#27272a] bg-transparent text-md px-3 py-2 focus-visible:ring-1 focus-visible:ring-blue-500 transition'
                        placeholder='••••••••••'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    {
                        (!isLogin && password) &&
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className='w-full space-y-1 mt-1'
                        >
                            <motion.div
                                key="number"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                <CheckMessage condition={hasNumber} message="At least one number" />
                            </motion.div>

                            <motion.div
                                key="special"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >
                                <CheckMessage condition={hasSpecialChar} message="At least one special character" />
                            </motion.div>

                            <motion.div
                                key="length"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                <CheckMessage condition={hasMinLength} message="At least 8 characters long" />
                            </motion.div>
                        </motion.div>

                    }
                </motion.div>

                {/* Role */}
                <AnimatePresence>
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className='flex flex-col gap-y-2 overflow-hidden'
                        >
                            <Label className='text-base sm:text-md'>Role</Label>
                            <Select onValueChange={value => setRole(value)}>
                                <SelectTrigger className="w-full border border-[#27272a] bg-transparent px-3 py-2">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent className='bg-[#09090b] text-[#e3e3e3]'>
                                    <SelectItem value="youtuber" className='hover:font-bold'>Youtuber</SelectItem>
                                    <SelectItem value="editor" className='hover:font-bold'>Editor</SelectItem>
                                </SelectContent>
                            </Select>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button */}
                <CustomButton
                    className='w-full text-base sm:text-md'
                    title={isLogin ? 'Log In' : 'Sign Up'}
                    cb={() => {
                        if (!email) throw new Error('Email is required');
                        if (!password) throw new Error('Password is required');
                        if (!isLogin && !name) throw new Error('Name is required');
                        if (!isLogin && !role) throw new Error('Role is required');
                        if (!isLogin && (!hasMinLength || !hasNumber || !hasSpecialChar)) throw new Error('Invalid Password');

                        AsyncFetcher({
                            url: '/api/auth/login',
                            methodType: 'POST',
                            body: { email, password },
                            cb: ({ message, user }) => {
                                console.log(message);
                                console.log(user);
                                setUser(user);
                                toast.success(message);
                                navigate.push('/dashboard');
                            }
                        })
                    }}
                />

                {/* Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className='flex gap-x-2 text-sm mx-auto'
                >
                    <p>{isLogin ? 'Not have an account?' : 'Already have an account?'}</p>
                    <p
                        onClick={() => {
                            setEmail('')
                            setName('')
                            setPassword('')
                            setRole('')
                            setIsLogin(!isLogin)
                        }}
                        className='cursor-pointer text-blue-500 hover:underline transition'
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </p>
                </motion.div>
            </div >

            {/* Logo */}
            < motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='mt-6'
            >
                <Image
                    src='/logo.png'
                    alt="JustOneUpload"
                    width={100}
                    height={100}
                    className='mx-auto w-16 h-16 sm:w-20 sm:h-20 object-contain'
                />
            </motion.div >
        </motion.div >
    );
};

export default Login;
