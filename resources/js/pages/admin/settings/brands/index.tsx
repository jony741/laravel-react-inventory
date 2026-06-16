import { Form, Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import BrandController from '@/actions/App/Http/Controllers/Settings/BrandController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/brands';
import type { Brand } from '@/types';

export default function BrandsIndex({ brands }: { brands: Brand[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const openCreateDialog = () => {
        setEditingBrand(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (brand: Brand) => {
        setEditingBrand(brand);
        setIsDialogOpen(true);
    };

    const deleteBrand = (brand: Brand) => {
        if (confirm('Are you sure you want to delete this brand?')) {
            router.delete(BrandController.destroy.url(brand));
        }
    };

    return (
        <>
            <Head title="Brands" />

            <div className="space-y-6 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Brands"
                        description="Manage your product brands"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Brand
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {brands.map((brand) => (
                                <tr key={brand.id}>
                                    <td className="px-4 py-3">{brand.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{brand.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${brand.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {brand.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(brand)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteBrand(brand)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {brands.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No brands found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                        <DialogDescription>
                            {editingBrand ? 'Update the details of your brand.' : 'Create a new brand for your products.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editingBrand 
                            ? BrandController.update.form(editingBrand) 
                            : BrandController.store.form()
                        )}
                        method={editingBrand ? 'patch' : 'post'}
                        onSuccess={() => setIsDialogOpen(false)}
                        transform={(data) => ({
                            ...data,
                            is_active: data.is_active === true || data.is_active === '1' || data.is_active === 'on',
                        })}
                        className="space-y-4"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={editingBrand?.name}
                                        required
                                        placeholder="Brand name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        defaultValue={editingBrand?.slug}
                                        required
                                        placeholder="brand-slug"
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        defaultValue={editingBrand?.description || ''}
                                        placeholder="Optional description"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        name="is_active"
                                        value="1"
                                        defaultChecked={editingBrand ? editingBrand.is_active : true} 
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Active
                                    </Label>
                                    <InputError message={errors.is_active} />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingBrand ? 'Update' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

BrandsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: index(),
        },
    ],
};
