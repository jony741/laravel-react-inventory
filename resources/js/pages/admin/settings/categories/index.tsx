import { Form, Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/Settings/CategoryController';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/categories';
import type { Category } from '@/types';

export default function CategoriesIndex({ 
    categories, 
    parentCategories 
}: { 
    categories: Category[], 
    parentCategories: Category[] 
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const deleteCategory = (category: Category) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(CategoryController.destroy.url(category));
        }
    };

    return (
        <>
            <Head title="Categories" />

            <div className="space-y-6 px-6 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Categories"
                        description="Manage your product categories"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Parent</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-4 py-3">{category.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {category.parent?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteCategory(category)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No categories found.
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
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update the details of your category.' : 'Create a new category for your products.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editingCategory 
                            ? CategoryController.update.form(editingCategory) 
                            : CategoryController.store.form()
                        )}
                        method={editingCategory ? 'patch' : 'post'}
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
                                        defaultValue={editingCategory?.name}
                                        required
                                        placeholder="Category name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        defaultValue={editingCategory?.slug}
                                        required
                                        placeholder="category-slug"
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="parent_id">Parent Category</Label>
                                    <Select name="parent_id" defaultValue={editingCategory?.parent_id?.toString() || ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a parent category (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">None</SelectItem>
                                            {parentCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.parent_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        defaultValue={editingCategory?.description || ''}
                                        placeholder="Optional description"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        name="is_active" 
                                        value="1"
                                        defaultChecked={editingCategory ? editingCategory.is_active : true} 
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
                                        {editingCategory ? 'Update' : 'Create'}
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

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Categories',
            href: index(),
        },
    ],
};
