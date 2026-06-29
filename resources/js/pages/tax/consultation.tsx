import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, MessageSquare, Phone, Shield } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pajak', href: '/tax' },
    { title: 'Konsultasi Pajak', href: '/tax/consultation' },
];

const FAQ = [
    {
        q: 'Siapa yang wajib membayar pajak UMKM?',
        a: 'Semua UMKM yang terdaftar sebagai Wajib Pajak dengan omzet di bawah Rp 4,8 miliar per tahun. Jika belum punya NPWP, daftarkan dulu ke KPP terdekat atau melalui pajak.go.id.',
    },
    {
        q: 'Berapa tarif PPh Final UMKM?',
        a: 'Tarif PPh Final untuk UMKM adalah 0,5% dari peredaran bruto (omzet) setiap bulan. Dibayarkan paling lambat tanggal 15 bulan berikutnya.',
    },
    {
        q: 'Apakah saya perlu lapor SPT Tahunan?',
        a: 'Ya, meskipun sudah bayar PPh Final setiap bulan, Anda tetap wajib lapor SPT Tahunan PPh Orang Pribadi setiap tahun (paling lambat 31 Maret).',
    },
    {
        q: 'Bagaimana cara daftar NPWP untuk bisnis?',
        a: 'Daftar NPWP bisa dilakukan secara online melalui pajak.go.id, atau datang langsung ke Kantor Pelayanan Pajak (KPP) terdekat. Siapkan KTP, Kartu Keluarga, dan dokumen bisnis.',
    },
    {
        q: 'Apakah ada insentif pajak untuk UMKM?',
        a: 'Ya! Pemerintah memberikan fasilitas tarif PPh Final 0,5% selama 7 tahun untuk UMKM orang pribadi. Manfaatkan insentif ini selagi masih berlaku.',
    },
];

export default function TaxConsultation() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konsultasi Pajak" />
            <div className="p-4 md:p-6">
                <div className="mb-6">
                    <Link href="/tax" className="hover:bg-muted inline-flex items-center gap-2 rounded-xl p-2 text-sm transition-colors">
                        <ArrowLeft size={16} />
                        Kembali ke Laporan Pajak
                    </Link>
                </div>

                <div className="mx-auto max-w-3xl">
                    {/* Header */}
                    <div className="from-indigo-600 to-purple-600 mb-6 rounded-2xl bg-gradient-to-r p-6 text-white">
                        <div className="flex items-center gap-3">
                            <Shield size={32} className="shrink-0 text-white/80" />
                            <div>
                                <h1 className="text-2xl font-bold">Konsultasi Pajak UMKM</h1>
                                <p className="mt-1 text-white/80">Informasi dan panduan perpajakan untuk bisnis Anda</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Contacts */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-3">
                        {[
                            { icon: Phone, title: 'Kring Pajak', desc: 'Hotline DJP', value: '1500200', href: 'tel:1500200', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                            { icon: MessageSquare, title: 'Live Chat DJP', desc: 'Chat online pajak.go.id', value: 'Kunjungi Website', href: 'https://www.pajak.go.id', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                            { icon: Clock, title: 'Jam Layanan', desc: 'Senin–Jumat', value: '08.00–16.00 WIB', href: null, color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
                        ].map(({ icon: Icon, title, desc, value, href, color }) => (
                            <div key={title} className={`rounded-2xl p-4 ${color}`}>
                                <Icon size={20} className="mb-2" />
                                <p className="font-semibold">{title}</p>
                                <p className="text-xs opacity-70">{desc}</p>
                                {href ? (
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm font-medium underline">{value}</a>
                                ) : (
                                    <p className="mt-1 text-sm font-medium">{value}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Key Tax Obligations */}
                    <div className="bg-card border-border mb-6 rounded-2xl border p-5 shadow-sm">
                        <h2 className="mb-4 font-semibold">Kewajiban Pajak Utama UMKM</h2>
                        <div className="space-y-3">
                            {[
                                { title: 'PPh Final 0,5%', desc: 'Dibayar bulanan, paling lambat tanggal 15 bulan berikutnya', period: 'Bulanan' },
                                { title: 'SPT Tahunan PPh OP', desc: 'Dilaporkan setiap tahun, paling lambat 31 Maret', period: 'Tahunan' },
                                { title: 'PPN (jika PKP)', desc: 'Wajib jika omzet > Rp 4,8 miliar, tarif 11%', period: 'Bulanan' },
                                { title: 'PPh 21 Karyawan', desc: 'Potong dan setor pajak penghasilan karyawan tiap bulan', period: 'Bulanan' },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <span className="bg-muted rounded-full px-2 py-0.5 text-xs">{item.period}</span>
                                        </div>
                                        <p className="text-muted-foreground mt-0.5 text-xs">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm">
                        <h2 className="mb-4 font-semibold">Pertanyaan Umum</h2>
                        <div className="space-y-4">
                            {FAQ.map((item, i) => (
                                <div key={i} className="border-border border-b pb-4 last:border-0 last:pb-0">
                                    <p className="mb-1.5 text-sm font-semibold">{item.q}</p>
                                    <p className="text-muted-foreground text-sm">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
