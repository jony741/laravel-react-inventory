<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\BrandRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings/brands/index', [
            'brands' => Brand::latest()->get(),
        ]);
    }

    public function store(BrandRequest $request): RedirectResponse
    {
        Brand::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand created.')]);

        return back();
    }

    public function update(BrandRequest $request, Brand $brand): RedirectResponse
    {
        $brand->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand updated.')]);

        return back();
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        $brand->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Brand deleted.')]);

        return back();
    }
}
