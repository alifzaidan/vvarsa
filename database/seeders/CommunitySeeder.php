<?php

namespace Database\Seeders;

use App\Models\CommunityPost;
use App\Models\CommunityReply;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::whereNotNull('tenant_id')->first();
        if (!$user) return;

        $posts = [
            [
                'title'         => 'Tips Mengelola Stok Bahan Baku di Musim Hujan',
                'content'       => "Halo teman-teman bisnis FnB! Saya mau berbagi pengalaman mengelola stok bahan baku terutama sayuran dan bahan segar di musim hujan.\n\n**1. Rotasi stok secara ketat**\nPastikan FIFO (First In, First Out) selalu diterapkan. Bahan yang masuk lebih dulu harus digunakan lebih dulu.\n\n**2. Monitor suhu penyimpanan**\nInvestasi di termometer ruang dan kulkas yang tepat sangat penting. Sayuran segar idealnya disimpan di suhu 4-7°C.\n\n**3. Punya supplier backup**\nJangan bergantung pada satu supplier saja. Selalu punya 2-3 alternatif supplier untuk bahan utama.\n\nSemoga bermanfaat! Ada yang punya tips lain?",
                'category'      => 'tips',
                'business_type' => 'fnb',
                'likes_count'   => 47,
                'replies_count' => 8,
                'views_count'   => 312,
                'is_pinned'     => true,
            ],
            [
                'title'         => 'Cara Efektif Membuat Laporan Keuangan Sederhana untuk Warung',
                'content'       => "Banyak pelaku UMKM yang masih bingung cara membuat laporan keuangan. Sebenarnya tidak perlu ribet!\n\nYang penting dicatat setiap hari:\n- **Pemasukan**: Catat total penjualan setiap hari\n- **Pengeluaran**: Belanja bahan, gaji, listrik, dll\n- **Modal akhir**: Hitung sisa kas + stok barang\n\nDengan data ini, di akhir bulan Anda bisa lihat:\n- Apakah bisnis untung atau rugi?\n- Pos pengeluaran mana yang terbesar?\n- Tren penjualan naik atau turun?\n\nSaya sekarang pakai aplikasi ini dan sangat membantu! 🙌",
                'category'      => 'discussion',
                'business_type' => 'fnb',
                'likes_count'   => 83,
                'replies_count' => 12,
                'views_count'   => 678,
                'is_pinned'     => false,
            ],
            [
                'title'         => 'Rekomendasi Supplier Bahan Baku Berkualitas di Jakarta?',
                'content'       => "Halo semua, saya baru buka warung makan kecil-kecilan di Jakarta Selatan.\n\nMau tanya, ada yang punya rekomendasi supplier sayuran dan bahan segar yang terpercaya di Jakarta? Kebutuhan saya masih kecil, sekitar 5-10 kg sayuran per hari.\n\nSudah coba ke pasar tradisional tapi harga tidak konsisten. Pernah coba apps pengiriman sayuran tapi biaya pengirimannya lumayan.\n\nMohon bantuannya teman-teman! 🙏",
                'category'      => 'question',
                'business_type' => 'fnb',
                'likes_count'   => 29,
                'replies_count' => 15,
                'views_count'   => 445,
                'is_pinned'     => false,
            ],
            [
                'title'         => 'Pengalaman Ikut Bazar Kuliner – Worth It atau Tidak?',
                'content'       => "Baru kemarin pulang dari Bazar Kuliner Nusantara dan mau share pengalaman!\n\n**Yang bagus:**\n- Traffic pengunjung luar biasa, hari pertama kami bisa dapat 3-4x penjualan normal\n- Networking dengan sesama pelaku FnB sangat bermanfaat\n- Dapat exposure brand yang lumayan\n\n**Yang perlu dipersiapkan:**\n- Biaya booth + modal besar (kami keluar ~Rp 2,5 juta)\n- Perlu staff tambahan minimal 2 orang\n- Stok harus disiapkan 3x lipat dari biasanya\n\n**Hasilnya?** Kami balik modal di hari kedua dan profit cukup lumayan di hari ketiga.\n\nKesimpulan: **Worth it** asal persiapan matang! 💪",
                'category'      => 'discussion',
                'business_type' => 'fnb',
                'likes_count'   => 104,
                'replies_count' => 23,
                'views_count'   => 892,
                'is_pinned'     => false,
            ],
            [
                'title'         => 'Panduan Pajak UMKM 2026 – Apa yang Perlu Diketahui?',
                'content'       => "Hei teman-teman, saya mau share info penting soal pajak UMKM untuk tahun 2026!\n\n**PPh Final UMKM**\nOMZET sampai Rp 4,8 miliar per tahun → tarif PPh Final 0,5% dari omzet bruto.\n\n**Siapa yang wajib bayar?**\nSemua UMKM yang terdaftar sebagai Wajib Pajak dan punya NPWP.\n\n**Kapan dibayarkan?**\nSetiap bulan, paling lambat tanggal 15 bulan berikutnya.\n\n**Tips:**\n- Daftar NPWP sekarang jika belum punya\n- Catat semua omzet dengan rapi\n- Konsultasi ke konsultan pajak atau KPP terdekat\n\nAda pertanyaan? Tanya di kolom komentar! 😊",
                'category'      => 'tips',
                'business_type' => 'general',
                'likes_count'   => 156,
                'replies_count' => 34,
                'views_count'   => 1243,
                'is_pinned'     => true,
            ],
        ];

        foreach ($posts as $postData) {
            $post = CommunityPost::create(array_merge($postData, [
                'tenant_id' => $user->tenant_id,
                'user_id'   => $user->id,
            ]));

            // Add a sample reply to each post
            CommunityReply::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'content' => 'Terima kasih infonya sangat bermanfaat! 👍',
                'likes_count' => rand(2, 15),
            ]);
        }
    }
}
