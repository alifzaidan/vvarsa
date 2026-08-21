import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthSplitLayoutProps {
    title?: string;
    description?: string;
    bgImage?: string;
    reverse?: boolean;
}

export default function AuthSplitLayout({ 
    children, 
    title, 
    description, 
    bgImage, 
    reverse = false 
}: PropsWithChildren<AuthSplitLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative min-h-dvh w-full overflow-hidden bg-[#0a192f] font-sans antialiased">
            
            {/* =========================================================================
                1. BACKGROUND VISUAL (STATIS - TIDAK BERGERAK)
               ========================================================================= */}
            <div className="hidden lg:grid grid-cols-2 h-dvh w-full absolute inset-0 z-0">
                
                {/* Sisi Kiri (Tampilan saat form di kanan / Login) */}
                <div className="relative h-full flex flex-col justify-between p-12 text-white border-r border-[#1e3a5f]/40 overflow-hidden">
                    {bgImage ? (
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={bgImage} 
                                alt="Visual Login" 
                                className="h-full w-full object-cover object-center" 
                            />
                            <div className="absolute inset-0 bg-[#0a192f]/40 backdrop-blur-[2px]" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0e2442] via-[#0a192f] to-[#06101e]" />
                            <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-[#1d4ed8]/20 blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-[#38bdf8]/10 blur-[90px] pointer-events-none" />
                        </>
                    )}

                    <Link href={route('home')} className="relative z-20 flex items-center gap-3 text-lg font-semibold tracking-wide text-white transition-opacity hover:opacity-90">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#1e3a5f]/60 border border-white/10 backdrop-blur-md">
                            <AppLogoIcon className="size-6 fill-current text-[#60a5fa]" />
                        </div>
                        <span>{name}</span>
                    </Link>

                    {quote && (
                        <div className="relative z-20 mt-auto">
                            <blockquote className="space-y-3 border-l-2 border-[#38bdf8]/40 pl-5">
                                <p className="text-lg font-normal leading-relaxed text-[#cbd5e1]">&ldquo;{quote.message}&rdquo;</p>
                                <footer className="text-sm font-medium tracking-wide text-[#94a3b8]">{quote.author}</footer>
                            </blockquote>
                        </div>
                    )}
                </div>

                {/* Sisi Kanan (Tampilan saat form meluncur ke kiri / Register) */}
                <div className="relative h-full flex flex-col justify-between p-12 text-white overflow-hidden">
                    {bgImage ? (
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={bgImage} 
                                alt="Visual Register" 
                                className="h-full w-full object-cover object-center" 
                            />
                            <div className="absolute inset-0 bg-[#0a192f]/40 backdrop-blur-[2px]" />
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#06101e] via-[#0a192f] to-[#0e2442]" />
                            <div className="absolute top-10 right-10 h-96 w-96 rounded-full bg-[#1d4ed8]/20 blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-1/4 -right-20 h-80 w-80 rounded-full bg-[#38bdf8]/10 blur-[90px] pointer-events-none" />
                        </>
                    )}

                    <div className="relative z-20 flex justify-end">
                        <Link href={route('home')} className="flex items-center gap-3 text-lg font-semibold tracking-wide text-white transition-opacity hover:opacity-90">
                            <span>{name}</span>
                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1e3a5f]/60 border border-white/10 backdrop-blur-md">
                                <AppLogoIcon className="size-6 fill-current text-[#60a5fa]" />
                            </div>
                        </Link>
                    </div>

                    <div className="relative z-20 mt-auto text-right">
                        <blockquote className="space-y-2 border-r-2 border-[#38bdf8]/40 pr-5">
                            <p className="text-lg font-normal leading-relaxed text-[#cbd5e1]">&ldquo;Join us today and unlock all premium features.&rdquo;</p>
                            <footer className="text-sm font-medium tracking-wide text-[#94a3b8]">{name} Team</footer>
                        </blockquote>
                    </div>
                </div>

            </div>

            {/* =========================================================================
                2. PANEL FORM PUTIH (SATU-SATUNYA ELEMEN YANG SLIDE)
               ========================================================================= */}
            <div 
                className={`relative z-20 flex min-h-dvh w-full items-center justify-center bg-white p-6 shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-1/2 lg:p-12 ${
                    reverse 
                        ? 'lg:-translate-x-full' // Meluncur ke kiri (Register)
                        : 'lg:translate-x-0'      // Tetap di kanan (Login)
                }`}
            >
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
                    
                    {/* Mobile Logo */}
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0a192f] shadow-md shadow-[#0a192f]/20">
                            <AppLogoIcon className="size-7 fill-current text-[#60a5fa]" />
                        </div>
                    </Link>

                    {/* Form Header */}
                    <div className="flex flex-col items-start gap-1.5 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a192f]">{title}</h1>
                        {description && (
                            <p className="text-sm text-balance text-slate-500">{description}</p>
                        )}
                    </div>

                    {/* Children Inputs & Controls */}
                    <div className="w-full text-slate-900 
                        [&_label]:text-[#0a192f] [&_label]:font-medium
                        [&_input]:border-slate-300 [&_input]:bg-white [&_input]:text-slate-900 [&_input]:placeholder:text-slate-400 [&_input]:focus:border-[#0e2442] [&_input]:focus:ring-[#0e2442]/15
                        [&_button[type=submit]]:bg-[#0a192f] [&_button[type=submit]]:text-white [&_button[type=submit]]:hover:bg-[#0e2442] [&_button[type=submit]]:shadow-lg [&_button[type=submit]]:shadow-[#0a192f]/25 [&_button[type=submit]]:transition-all
                        [&_a]:text-[#0e2442] [&_a]:font-semibold [&_a]:hover:text-[#1e3a5f] [&_a]:hover:underline
                        [&_input[type=checkbox]]:border-slate-300 [&_input[type=checkbox]]:text-[#0a192f] [&_input[type=checkbox]]:focus:ring-[#0a192f]
                        [&_p.text-muted-foreground]:text-slate-500
                    ">
                        {children}
                    </div>

                </div>
            </div>

        </div>
    );
}   