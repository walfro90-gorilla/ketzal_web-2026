'use client'

import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Link } from "@/navigation";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";

import { use } from "react";

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const [state, formAction, isPending] = useActionState(loginAction, null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-black tracking-tighter text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to access your Ketzal portal</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="locale" value={locale} />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-center">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white text-black font-bold rounded-xl py-3.5 mt-6 hover:bg-gray-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-white font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 text-xs text-gray-700 text-center max-w-xs">
                By continuing, you agree to Ketzal's Terms of Service and Privacy Policy.
            </div>
        </div>
    );
}
