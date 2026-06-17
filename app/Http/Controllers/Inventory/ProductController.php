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
use Illuminate\Support\Str;

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
        $data = $request->safe()->except('variants');
        $data['slug'] = Str::slug($request->validated('name'));

        $product = Product::create($data);

        if ($request->has('variants')) {
            foreach ($request->validated('variants') as $index => $variant) {
                $variant['barcode'] = 'PRD' . str_pad($product->id, 5, '0', STR_PAD_LEFT) . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . substr(time(), -4);
                $product->variants()->create($variant);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return back();
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->safe()->except('variants');
        $data['slug'] = Str::slug($request->validated('name'));

        $product->update($data);

        if ($request->has('variants')) {
            $variantIds = [];
            $newVariantIndex = $product->variants()->count();

            foreach ($request->validated('variants') as $variantData) {
                if (isset($variantData['id'])) {
                    $variant = $product->variants()->find($variantData['id']);
                    if ($variant) {
                        $variant->update($variantData);
                        $variantIds[] = $variant->id;
                    }
                } else {
                    $newVariantIndex++;
                    $variantData['barcode'] = 'PRD' . str_pad($product->id, 5, '0', STR_PAD_LEFT) . str_pad($newVariantIndex, 3, '0', STR_PAD_LEFT) . substr(time(), -4);
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
