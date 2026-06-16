<?php

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
        Route::resource('/settings/brands', BrandController::class);
        Route::resource('/settings/categories', CategoryController::class);
        Route::resource('/settings/stores', StoreController::class);
    });

require __DIR__.'/settings.php';
