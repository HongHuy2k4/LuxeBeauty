<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cat = \App\Models\Category::create([
    'name' => 'Skincare',
    'slug' => 'skincare',
    'description' => 'Skin care products',
    'status' => 'active'
]);

$brand = \App\Models\Brand::create([
    'name' => 'LuxeBrand',
    'slug' => 'luxe-brand',
    'description' => 'Premium cosmetics',
    'status' => 'active'
]);

for ($i = 1; $i <= 5; $i++) {
    \App\Models\Product::create([
        'name' => 'Premium Serum ' . $i,
        'slug' => 'premium-serum-' . $i,
        'category_id' => $cat->id,
        'brand_id' => $brand->id,
        'price' => 100.00 + ($i * 10),
        'original_price' => 150.00 + ($i * 10),
        'images' => ['https://placehold.co/600x400/png'],
        'description' => 'A wonderful serum for your face.',
        'stock' => 50,
        'status' => 'available'
    ]);
}
echo 'Dummy products generated!';
