<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreRequest;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings/stores/index', [
            'stores' => Store::latest()->get(),
        ]);
    }

    public function store(StoreRequest $request): RedirectResponse
    {
        Store::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Store created.')]);

        return back();
    }

    public function update(StoreRequest $request, Store $store): RedirectResponse
    {
        $store->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Store updated.')]);

        return back();
    }

    public function destroy(Store $store): RedirectResponse
    {
        $store->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Store deleted.')]);

        return back();
    }
}
