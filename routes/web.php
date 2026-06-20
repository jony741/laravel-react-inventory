<?php

use App\Http\Controllers\Crm\CustomerController;
use App\Http\Controllers\Crm\SupplierController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\GoodsReceiptController;
use App\Http\Controllers\Inventory\PurchaseOrderController;
use App\Http\Controllers\Settings\BrandController;
use App\Http\Controllers\Settings\CategoryController;
use App\Http\Controllers\Settings\StoreController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// Admin Settings route
Route::middleware('auth')
    ->prefix('admin')
    ->group(function () {
        Route::resource('/inventory/products', ProductController::class);
        Route::resource('/inventory/purchase-orders', PurchaseOrderController::class);
        Route::patch('/inventory/purchase-orders/{purchase_order}/approve', [PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
        Route::get('/inventory/goods-receipts', [GoodsReceiptController::class, 'index'])->name('goods-receipts.index');
        Route::get('/inventory/goods-receipts/create/{purchase_order}', [GoodsReceiptController::class, 'create'])->name('goods-receipts.create');
        Route::post('/inventory/goods-receipts', [GoodsReceiptController::class, 'store'])->name('goods-receipts.store');
        Route::get('/inventory/goods-receipts/{goods_receipt}', [GoodsReceiptController::class, 'show'])->name('goods-receipts.show');
        Route::resource('/crm/customers', CustomerController::class);
        Route::resource('/crm/suppliers', SupplierController::class);
        Route::resource('/settings/brands', BrandController::class);
        Route::resource('/settings/categories', CategoryController::class);
        Route::resource('/settings/stores', StoreController::class);
    });

require __DIR__.'/settings.php';
