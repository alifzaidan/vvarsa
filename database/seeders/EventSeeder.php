<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'title'                        => 'Bazar Kuliner Nusantara 2026',
                'organizer'                    => 'Dinas UMKM Jakarta',
                'business_types'              => ['fnb'],
                'location'                    => 'Lapangan Banteng, Jakarta Pusat',
                'city'                        => 'Jakarta',
                'description'                 => 'Festival kuliner terbesar di Jakarta yang menampilkan ratusan UMKM makanan dan minuman dari seluruh Indonesia. Kesempatan terbaik untuk memperluas jaringan bisnis dan meningkatkan penjualan.',
                'start_date'                  => '2026-07-15 08:00:00',
                'end_date'                    => '2026-07-17 21:00:00',
                'max_participants'            => 200,
                'registered_count'            => 87,
                'registration_fee'            => 250000,
                'allow_platform_registration' => true,
                'status'                      => 'upcoming',
                'is_featured'                 => true,
            ],
            [
                'title'                        => 'FnB Business Summit 2026',
                'organizer'                    => 'Asosiasi Pengusaha FnB Indonesia',
                'business_types'              => ['fnb'],
                'location'                    => 'Jakarta Convention Center',
                'city'                        => 'Jakarta',
                'description'                 => 'Konferensi bisnis FnB terkemuka yang menghadirkan pembicara dari industri makanan & minuman. Pelajari tren terbaru, networking dengan investor, dan dapatkan insight bisnis dari para ahli.',
                'start_date'                  => '2026-08-05 09:00:00',
                'end_date'                    => '2026-08-05 17:00:00',
                'max_participants'            => 500,
                'registered_count'            => 213,
                'registration_fee'            => 500000,
                'allow_platform_registration' => true,
                'status'                      => 'upcoming',
                'is_featured'                 => true,
            ],
            [
                'title'                        => 'Pasar Malam Ramadhan – Pameran Produk Lokal',
                'organizer'                    => 'Komunitas UMKM Bandung',
                'business_types'              => ['fnb', 'retail', 'fashion'],
                'location'                    => 'Alun-alun Kota Bandung',
                'city'                        => 'Bandung',
                'description'                 => 'Pameran produk UMKM lokal di bulan Ramadhan. Buka kesempatan berjualan dan memperkenalkan produk Anda kepada ribuan pengunjung setiap malam.',
                'start_date'                  => '2026-09-01 17:00:00',
                'end_date'                    => '2026-09-30 22:00:00',
                'max_participants'            => 150,
                'registered_count'            => 62,
                'registration_fee'            => 150000,
                'allow_platform_registration' => true,
                'status'                      => 'upcoming',
                'is_featured'                 => false,
            ],
            [
                'title'                        => 'Workshop: Manajemen Keuangan UMKM',
                'organizer'                    => 'Vvarsa Education',
                'business_types'              => ['fnb', 'retail', 'fashion', 'general'],
                'location'                    => 'Online (Zoom)',
                'city'                        => 'Online',
                'description'                 => 'Workshop online intensif tentang manajemen keuangan untuk UMKM. Pelajari cara membuat laporan keuangan sederhana, mengelola arus kas, dan merencanakan pajak bisnis Anda.',
                'start_date'                  => '2026-07-20 13:00:00',
                'end_date'                    => '2026-07-20 16:00:00',
                'max_participants'            => null,
                'registered_count'            => 341,
                'registration_fee'            => 0,
                'allow_platform_registration' => true,
                'status'                      => 'upcoming',
                'is_featured'                 => false,
            ],
            [
                'title'                        => 'Surabaya Food Expo 2026',
                'organizer'                    => 'PT Expoindo Sukses Mandiri',
                'business_types'              => ['fnb'],
                'location'                    => 'Grand City Convex Surabaya',
                'city'                        => 'Surabaya',
                'description'                 => 'Pameran produk makanan, minuman, dan peralatan dapur terbesar di Jawa Timur. Temui distributor, investor, dan mitra bisnis potensial.',
                'start_date'                  => '2026-10-10 09:00:00',
                'end_date'                    => '2026-10-12 18:00:00',
                'max_participants'            => 300,
                'registered_count'            => 44,
                'registration_fee'            => 350000,
                'allow_platform_registration' => true,
                'status'                      => 'upcoming',
                'is_featured'                 => false,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
