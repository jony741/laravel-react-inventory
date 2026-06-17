<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\ProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/inventory/products/index', [
            'products' => Inertia::defer(fn () => Product::with(['category', 'brand', 'variants'])
                ->latest()
                ->paginate(10)),
            'categories' => Category::where('is_active', true)->get(['id', 'name']),
            'brands' => Brand::where('is_active', true)->get(['id', 'name']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::create($request->safe()->except('variants'));

        if ($request->has('variants')) {
            foreach ($request->validated('variants') as $variant) {
                $product->variants()->create($variant);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return back();
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->safe()->except('variants'));

        if ($request->has('variants')) {
            $variantIds = [];

            foreach ($request->validated('variants') as $variantData) {
                if (isset($variantData['id'])) {
                    $variant = $product->variants()->find($variantData['id']);
                    if ($variant) {
                        $variant->update($variantData);
                        $variantIds[] = $variant->id;
                    }
                } else {
                    $newVariant = $product->variants()->create($variantData);
                    $variantIds[] = $newVariant->id;
                }
            }

            $product->variants()->whereNotIn('id', $variantIds)->delete();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated.')]);

        return back();
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->variants()->delete();
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted.')]);

        return back();
    }
}
