import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import { BookOpen, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh overflow-hidden">
            {/* Left Side - Form */}
            <div className="relative flex w-full items-center justify-center bg-background p-6 md:w-1/2 md:p-10">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-3 font-medium"
                            >
                                <div className="mb-1 flex size-16 items-center justify-center rounded-xl bg-white shadow-lg">
                                    <AppLogoIcon className="size-14" />
                                </div>
                                <span className="text-lg font-semibold tracking-tight">
                                    Rumah Tahfizh As-Sakinah
                                </span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400">
                                    {title}
                                </h1>
                                <p className="text-center text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Side - Gradient Background with Features */}
            <div className="hidden w-1/2 md:flex">
                <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-12 text-white">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20" />
                    <div className="absolute -top-4 -left-4 size-72 animate-pulse rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -right-4 -bottom-4 size-72 animate-pulse rounded-full bg-white/10 blur-3xl delay-700" />

                    {/* Content */}
                    <div className="relative z-10 space-y-12">
                        <div className="space-y-4">
                            <h2 className="text-4xl leading-tight font-bold">
                                Kelola Hafalan
                                <br />
                                Al-Quran dengan Mudah
                            </h2>
                            <p className="text-lg text-white/90">
                                Platform modern untuk monitoring dan evaluasi
                                hafalan santri
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Feature 1 */}
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <BookOpen className="size-6" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold">
                                        Pencatatan Digital
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        Catat setoran hafalan secara real-time
                                        dengan sistem yang terintegrasi
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Sparkles className="size-6" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold">
                                        Analitik Mendalam
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        Dashboard analytics dengan grafik
                                        interaktif dan laporan lengkap
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <CheckCircle className="size-6" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold">
                                        Progress Tracking
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        Monitor perkembangan hafalan setiap
                                        santri dengan mudah
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Shield className="size-6" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold">
                                        Aman & Terpercaya
                                    </h3>
                                    <p className="text-sm text-white/80">
                                        Data tersimpan dengan aman dan dapat
                                        diakses kapan saja
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Quote */}
                        <div className="mt-12 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                            <p className="mb-2 text-sm text-white/90 italic">
                                "Sebaik-baik kalian adalah orang yang belajar
                                Al-Quran dan mengajarkannya"
                            </p>
                            <p className="text-xs text-white/70">
                                - HR. Bukhari
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
