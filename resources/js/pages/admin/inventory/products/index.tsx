import { Form, Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, X, Package, ArrowLeft, Eye, Check, Info, Tag, Layers, Upload, ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import ProductController from '@/actions/App/Http/Controllers/Inventory/ProductController';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination from '@/components/pagination';
import type {PaginationData} from '@/components/pagination';
import TableSkeleton from '@/components/table-skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/products';
import type { Product, Brand, Category } from '@/types';

// Switch component for toggle
function Switch({ checked, onCheckedChange, id }: { checked: boolean; onCheckedChange: (checked: boolean) => void; id?: string }) {
    return (
        <button
            type="button"
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                checked ? 'bg-green-500' : 'bg-gray-600'
            }`}
        >
            <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
}

type VariantFormData = {
    id?: number;
    sku: string;
    barcode: string;
    color: string;
    size: string;
    cost: string;
    price: string;
    reorder_level: number;
    is_active: boolean;
};

const emptyVariant: VariantFormData = {
    sku: '',
    barcode: '',
    color: '',
    size: '',
    cost: '',
    price: '',
    reorder_level: 0,
    is_active: true,
};

const PRODUCT_UNITS = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gm', label: 'Gram (gm)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'oz', label: 'Ounce (oz)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'in', label: 'Inch (in)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'set', label: 'Set' },
    { value: 'pair', label: 'Pair' },
    { value: 'dozen', label: 'Dozen' },
] as const;

type Props = {
    products?: PaginationData<Product>;
    categories: Pick<Category, 'id' | 'name'>[];
    brands: Pick<Brand, 'id' | 'name'>[];
};

export default function ProductsIndex({ products, categories, brands }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [variants, setVariants] = useState<VariantFormData[]>([{ ...emptyVariant }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [productStatus, setProductStatus] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');

                return;
            }

            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openPreview = (product: Product) => {
        setPreviewProduct(product);
        setIsPreviewOpen(true);
    };

    const openCreateDialog = () => {
        setEditingProduct(null);
        setVariants([{ ...emptyVariant }]);
        setProductStatus(true);
        setSelectedImage(null);
        setImagePreview(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        setProductStatus(product.is_active);
        setSelectedImage(null);
        setImagePreview(product.image ? `/storage/${product.image}` : null);

        if (product.variants && product.variants.length > 0) {
            setVariants(product.variants.map(v => ({
                id: v.id,
                sku: v.sku,
                barcode: v.barcode || '',
                color: v.color || '',
                size: v.size || '',
                cost: v.cost,
                price: v.price,
                reorder_level: v.reorder_level,
                is_active: v.is_active,
            })));
        } else {
            setVariants([{ ...emptyVariant }]);
        }

        setIsDialogOpen(true);
    };

    const addVariant = () => {
        setVariants([...variants, { ...emptyVariant }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    const updateVariant = (index: number, field: keyof VariantFormData, value: string | number | boolean) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const getPriceRange = (product: Product) => {
        if (!product.variants || product.variants.length === 0) {
            return '-';
        }

        const prices = product.variants.map(v => parseFloat(v.price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        if (min === max) {
            return `৳${min.toFixed(0)}`;
        }

        return `৳${min.toFixed(0)} - ৳${max.toFixed(0)}`;
    };

    const getVariantColors = (product: Product) => {
        if (!product.variants) {
            return [];
        }

        const colors = product.variants
            .map(v => v.color)
            .filter((c): c is string => c !== null && c !== '');

        return [...new Set(colors)].slice(0, 3);
    };

    const colorMap: Record<string, string> = {
        'black': 'bg-gray-900',
        'carbon black': 'bg-gray-800',
        'white': 'bg-white border border-gray-300',
        'silver': 'bg-gray-400',
        'silver grey': 'bg-gray-400',
        'grey': 'bg-gray-500',
        'gray': 'bg-gray-500',
        'red': 'bg-red-500',
        'blue': 'bg-blue-500',
        'navy': 'bg-blue-900',
        'navy blue': 'bg-blue-900',
        'green': 'bg-green-500',
        'yellow': 'bg-yellow-500',
        'orange': 'bg-orange-500',
        'purple': 'bg-purple-500',
        'pink': 'bg-pink-500',
    };

    const getColorClass = (color: string) => {
        return colorMap[color.toLowerCase()] || 'bg-gray-400';
    };

    return (
        <>
            <Head title="Products" />

            <div className="space-y-6 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Products"
                        description="Manage your product catalog and variants"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium w-12">#</th>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Variants</th>
                                <th className="px-4 py-3 font-medium">Price Range</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {!products ? (
                                <TableSkeleton rows={10} columns={7} />
                            ) : (
                                <>
                                    {products.data.map((product, idx) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {products.from + idx}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {product.image ? (
                                                        <img
                                                            src={`/storage/${product.image}`}
                                                            alt={product.name}
                                                            className="h-10 w-10 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                            <Package className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {product.brand?.name && (
                                                                <span className="bg-yellow-200 text-yellow-800 px-1 rounded mr-1">
                                                                    {product.brand.name}
                                                                </span>
                                                            )}
                                                            {product.unit && <span>{product.unit}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {product.category?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {product.variants?.length || 0}
                                                    </span>
                                                    <div className="flex -space-x-1">
                                                        {getVariantColors(product).map((color, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-4 w-4 rounded-full ${getColorClass(color)}`}
                                                                title={color}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {getPriceRange(product)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {product.is_active ? 'Active' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openPreview(product)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmationDialog
                                                        action={ProductController.destroy(product)}
                                                        title="Delete product?"
                                                        description={`This will permanently delete "${product.name}" and all its variants.`}
                                                        confirmLabel="Delete product"
                                                        processingLabel="Deleting product..."
                                                    >
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            <span className="sr-only">Delete {product.name}</span>
                                                        </Button>
                                                    </DeleteConfirmationDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No products found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                    {products && products.total > products.per_page && (
                        <Pagination
                            links={products.links}
                            from={products.from}
                            to={products.to}
                            total={products.total}
                        />
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[80%] max-w-[80%] h-[95vh] p-0 gap-0 sm:max-w-[80%] flex flex-col overflow-hidden">
                    <Form
                        className="flex flex-col h-full"
                        {...(editingProduct
                            ? ProductController.update.form(editingProduct)
                            : ProductController.store.form()
                        )}
                        method={editingProduct ? 'patch' : 'post'}
                        encType="multipart/form-data"
                        onSuccess={() => {
                            setIsDialogOpen(false);
                            setSelectedImage(null);
                            setImagePreview(null);
                        }}
                        transform={(data) => ({
                            ...data,
                            is_active: productStatus,
                            image: selectedImage,
                            variants: variants.map(v => ({
                                ...v,
                                is_active: v.is_active === true,
                            })),
                        })}
                    >
                        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                        {({ errors, processing, data }) => (
                            <>
                                {/* Header - Sticky */}
                                <div className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-10 py-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        <span>Products</span>
                                        <span className="text-muted-foreground/50">›</span>
                                        <span className="text-foreground font-medium">
                                            {editingProduct?.name || 'New Product'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        {/*<Button type="button" variant="outline" size="sm">*/}
                                        {/*    <Eye className="mr-2 h-4 w-4" />*/}
                                        {/*    Preview*/}
                                        {/*</Button>*/}
                                        <Button type="submit" size="sm" disabled={processing}>
                                            <Check className="mr-2 h-4 w-4" />
                                            Save changes
                                        </Button>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Product Title */}
                                    <div className="px-6 py-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt={editingProduct?.name || 'Product'}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <h1 className="text-xl font-semibold">
                                                    {editingProduct?.name || 'New Product'}
                                                </h1>
                                            </div>
                                            {editingProduct && (
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                                                    productStatus
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                    <span className={`h-2 w-2 rounded-full ${productStatus ? 'bg-green-500' : 'bg-gray-500'}`} />
                                                    {productStatus ? 'Active' : 'Draft'} · {variants.length} variant{variants.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="p-6 space-y-6">
                                    {/* Two Column Layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Product Information Card */}
                                        <div className="rounded-xl border bg-card p-5 space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                Product information
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-xs text-muted-foreground">Product name</Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        defaultValue={editingProduct?.name}
                                                        required
                                                        placeholder="Keychron Q1 Pro"
                                                        className="bg-muted/50 border-0"
                                                    />
                                                    <InputError message={errors.name} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="description" className="text-xs text-muted-foreground">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        name="description"
                                                        defaultValue={editingProduct?.description || ''}
                                                        placeholder="QMK/VIA support, double-shot PBT keycaps, and hot-swappable switches. Built for enthusiasts."
                                                        rows={4}
                                                        className="bg-muted/50 border-0 resize-none"
                                                    />
                                                    <InputError message={errors.description} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Product Image</Label>
                                                    <div className="flex items-start gap-4">
                                                        {imagePreview ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={imagePreview}
                                                                    alt="Product preview"
                                                                    className="h-24 w-24 rounded-lg object-cover border"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={removeImage}
                                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                                                                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 space-y-2">
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                                                onChange={handleImageChange}
                                                                className="hidden"
                                                                id="product-image"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => fileInputRef.current?.click()}
                                                            >
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                {imagePreview ? 'Change Image' : 'Upload Image'}
                                                            </Button>
                                                            <p className="text-xs text-muted-foreground">
                                                                PNG, JPG, GIF or WebP. Max 2MB.
                                                            </p>
                                                            <InputError message={errors.image} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Organization Card */}
                                        <div className="rounded-xl border bg-card p-5 space-y-4">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                Organization
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="category_id" className="text-xs text-muted-foreground">Category</Label>
                                                    <Select name="category_id" defaultValue={editingProduct?.category_id?.toString() || ''}>
                                                        <SelectTrigger className="bg-muted/50 border-0 w-full">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(cat => (
                                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.category_id} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="brand_id" className="text-xs text-muted-foreground">Brand</Label>
                                                    <Select name="brand_id" defaultValue={editingProduct?.brand_id?.toString() || ''}>
                                                        <SelectTrigger className="bg-muted/50 border-0 w-full">
                                                            <SelectValue placeholder="Select brand" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {brands.map(brand => (
                                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                    {brand.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.brand_id} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="unit" className="text-xs text-muted-foreground">Unit</Label>
                                                    <Select name="unit" defaultValue={editingProduct?.unit || ''}>
                                                        <SelectTrigger className="bg-muted/50 border-0 w-full">
                                                            <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {PRODUCT_UNITS.map(unit => (
                                                                <SelectItem key={unit.value} value={unit.value}>
                                                                    {unit.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.unit} />
                                                </div>

                                                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                                                    <div>
                                                        <div className="font-medium text-sm">Product status</div>
                                                        <div className="text-xs text-muted-foreground">Visible & sellable</div>
                                                    </div>
                                                    <Switch
                                                        id="is_active"
                                                        checked={productStatus}
                                                        onCheckedChange={setProductStatus}
                                                    />
                                                    <input type="hidden" name="is_active" value={productStatus ? '1' : '0'} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variants Section */}
                                    <div className="rounded-xl border bg-card p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Layers className="h-4 w-4 text-muted-foreground" />
                                                Variants
                                                <span className="text-muted-foreground font-normal">
                                                    {variants.length} SKU{variants.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addVariant}
                                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add another variant
                                            </button>
                                        </div>

                                        <div className="rounded-lg border overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                <tr className="text-muted-foreground">
                                                    <th className="px-4 py-3 text-left font-medium w-12">#</th>
                                                    <th className="px-4 py-3 text-left font-medium">SKU</th>
                                                    <th className="px-4 py-3 text-left font-medium">Color</th>
                                                    <th className="px-4 py-3 text-left font-medium">Size</th>
                                                    <th className="px-4 py-3 text-left font-medium">Cost</th>
                                                    <th className="px-4 py-3 text-left font-medium">Price</th>
                                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                                    <th className="px-4 py-3 w-10"></th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {variants.map((variant, idx) => (
                                                        <tr key={idx} className="bg-card">
                                                            <td className="px-4 py-3 text-muted-foreground font-medium">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Input
                                                                    value={variant.sku}
                                                                    onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                                                    placeholder="SKU-001"
                                                                    className="h-8 bg-transparent border-0 p-0 font-medium focus-visible:ring-0"
                                                                    required
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    {variant.color && (
                                                                        <div
                                                                            className={`h-4 w-4 rounded-full shrink-0 ${getColorClass(variant.color)}`}
                                                                        />
                                                                    )}
                                                                    <Input
                                                                        value={variant.color}
                                                                        onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                                                                        placeholder="Color"
                                                                        className="h-8 bg-transparent border-0 p-0 focus-visible:ring-0"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <Input
                                                                    value={variant.size}
                                                                    onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                                                                    placeholder="Size"
                                                                    className="h-8 bg-transparent border-0 p-0 focus-visible:ring-0"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center">
                                                                    <span className="text-muted-foreground mr-1">৳</span>
                                                                    <Input
                                                                        type="number"
                                                                        value={variant.cost}
                                                                        onChange={(e) => updateVariant(idx, 'cost', e.target.value)}
                                                                        placeholder="0"
                                                                        className="h-8 w-20 bg-transparent border-0 p-0 focus-visible:ring-0"
                                                                        min="0"
                                                                        step="0.01"
                                                                        required
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center font-medium">
                                                                    <span className="text-muted-foreground mr-1">৳</span>
                                                                    <Input
                                                                        type="number"
                                                                        value={variant.price}
                                                                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                                                        placeholder="0"
                                                                        className="h-8 w-20 bg-transparent border-0 p-0 font-medium focus-visible:ring-0"
                                                                        min="0"
                                                                        step="0.01"
                                                                        required
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateVariant(idx, 'is_active', !variant.is_active)}
                                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                                                                        variant.is_active
                                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                                    }`}
                                                                >
                                                                    <span className={`h-1.5 w-1.5 rounded-full ${variant.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                                    {variant.is_active ? 'Active' : 'Draft'}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {variants.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                        onClick={() => removeVariant(idx)}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>


                                    </div>
                                </div>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="w-[80%] max-w-[80%] h-[95vh] p-0 gap-0 sm:max-w-[80%] flex flex-col overflow-hidden">
                    {/* Header - Sticky */}
                    <div className="sticky top-0 z-10 bg-background flex items-center justify-between border-b px-10 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>Products</span>
                            <span className="text-muted-foreground/50">›</span>
                            <span className="text-foreground font-medium">
                                {previewProduct?.name || 'Product'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Close
                            </Button>
                            <Button type="button" size="sm" onClick={() => {
                                setIsPreviewOpen(false);
                                
                                if (previewProduct) {
                                    openEditDialog(previewProduct);
                                }
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Product Title */}
                        <div className="px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {previewProduct?.image ? (
                                        <img
                                            src={`/storage/${previewProduct.image}`}
                                            alt={previewProduct.name}
                                            className="h-10 w-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <h1 className="text-xl font-semibold">
                                        {previewProduct?.name || 'Product'}
                                    </h1>
                                </div>
                                {previewProduct && (
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                                        previewProduct.is_active
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        <span className={`h-2 w-2 rounded-full ${previewProduct.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                                        {previewProduct.is_active ? 'Active' : 'Draft'} · {previewProduct.variants?.length || 0} variant{(previewProduct.variants?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="p-6 space-y-6">
                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Product Information Card */}
                                <div className="rounded-xl border bg-card p-5 space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Product information
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">Product name</div>
                                            <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
                                                {previewProduct?.name || '-'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">Description</div>
                                            <div className="bg-muted/50 rounded-md px-3 py-2 text-sm min-h-[80px]">
                                                {previewProduct?.description || '-'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">Product Image</div>
                                            {previewProduct?.image ? (
                                                <img
                                                    src={`/storage/${previewProduct.image}`}
                                                    alt={previewProduct.name}
                                                    className="h-24 w-24 rounded-lg object-cover border"
                                                />
                                            ) : (
                                                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Organization Card */}
                                <div className="rounded-xl border bg-card p-5 space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                        Organization
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">Category</div>
                                            <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
                                                {previewProduct?.category?.name || '-'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">Brand</div>
                                            <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
                                                {previewProduct?.brand?.name || '-'}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground">Unit</div>
                                            <div className="bg-muted/50 rounded-md px-3 py-2 text-sm">
                                                {previewProduct?.unit || '-'}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                                            <div>
                                                <div className="font-medium text-sm">Product status</div>
                                                <div className="text-xs text-muted-foreground">Visible & sellable</div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                previewProduct?.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${previewProduct?.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                {previewProduct?.is_active ? 'Active' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variants Section */}
                            <div className="rounded-xl border bg-card p-5 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                    Variants
                                    <span className="text-muted-foreground font-normal">
                                        {previewProduct?.variants?.length || 0} SKU{(previewProduct?.variants?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="rounded-lg border overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                        <tr className="text-muted-foreground">
                                            <th className="px-4 py-3 text-left font-medium w-12">#</th>
                                            <th className="px-4 py-3 text-left font-medium">SKU</th>
                                            <th className="px-4 py-3 text-left font-medium">Barcode</th>
                                            <th className="px-4 py-3 text-left font-medium">Color</th>
                                            <th className="px-4 py-3 text-left font-medium">Size</th>
                                            <th className="px-4 py-3 text-left font-medium">Cost</th>
                                            <th className="px-4 py-3 text-left font-medium">Price</th>
                                            <th className="px-4 py-3 text-left font-medium">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {previewProduct?.variants?.map((variant, idx) => (
                                                <tr key={variant.id} className="bg-card">
                                                    <td className="px-4 py-3 text-muted-foreground font-medium">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {variant.sku || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                                        {variant.barcode || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {variant.color && (
                                                                <div
                                                                    className={`h-4 w-4 rounded-full shrink-0 ${getColorClass(variant.color)}`}
                                                                />
                                                            )}
                                                            <span>{variant.color || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {variant.size || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        ৳{variant.cost}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        ৳{variant.price}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            variant.is_active
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${variant.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                            {variant.is_active ? 'Active' : 'Draft'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!previewProduct?.variants || previewProduct.variants.length === 0) && (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                                        No variants found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
    ],
};
