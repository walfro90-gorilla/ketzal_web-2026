'use client'

import { useActionState, useState, use } from "react";
import { signupAction } from "@/app/actions/auth";
import { Link } from "@/navigation";
import { Loader2, Lock, Mail, User, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ProviderJoinPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('Auth');
    const tCommon = useTranslations('Common');

    const [state, formAction, isPending] = useActionState(signupAction, null);

    // State for controlled inputs
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");

    // Role is fixed to provider
    const role = "provider";

    // Success View
    if (state?.success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t('success_title')}</h2>
                    <p className="text-gray-400 mb-8">{t('success_msg')}</p>
                    <Link href="/login" className="block w-full bg-white text-black font-bold rounded-xl py-3 hover:bg-gray-200 transition-all">
                        {t('login')}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-sm my-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-white mb-2 text-center">{t('provider_join_title')}</h1>
                    <p className="text-gray-400 text-sm text-center">{t('provider_join_subtitle')}</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="role" value={role} />

                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t('full_name')}</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="text"
                                name="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t('username')}</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="business_name"
                                required
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Provider Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t('service_type')}</label>
                        <div className="relative">
                            <select
                                name="provider_type"
                                required
                                defaultValue=""
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl px-4 py-3 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>{t('select_type')}</option>
                                <option value="tour">{t('type_tour')}</option>
                                <option value="experience">{t('type_experience')}</option>
                                <option value="lodging">{t('type_lodging')}</option>
                                <option value="transport">{t('type_transport')}</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t('email')}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contact@business.com"
                                required
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t('password')}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-[#1a1a1a] border border-white/10 focus:border-primary/50 text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-center text-center">
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
                                <span>{t('register')}</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center bg-white/5 p-4 rounded-xl">
                    <p className="text-gray-500 text-sm">
                        {t('already_have_account')}{' '}
                        <Link href="/login" className="text-white font-semibold hover:underline">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 text-xs text-gray-700 text-center max-w-xs mb-8">
                By continuing, you agree to Ketzal's Terms of Service and Privacy Policy.
            </div>
        </div>
    );
}
