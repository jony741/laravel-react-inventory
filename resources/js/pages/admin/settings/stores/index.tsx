import { Form, Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import StoreController from '@/actions/App/Http/Controllers/Settings/StoreController';
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
import { index } from '@/routes/stores';

import type { Store } from '@/types';

export default function StoresIndex({ stores }: { stores: Store[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const openCreateDialog = () => {
        setEditingStore(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (store: Store) => {
        setEditingStore(store);
        setIsDialogOpen(true);
    };

    const deleteStore = (store: Store) => {
        if (confirm('Are you sure you want to delete this store?')) {
            router.delete(StoreController.destroy.url(store));
        }
    };

    return (
        <>
            <Head title="Stores" />

            <div className="space-y-6 px-6 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Stores"
                        description="Manage your stores/warehouses"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Code</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {stores.map((store) => (
                                <tr key={store.id}>
                                    <td className="px-4 py-3">{store.name}</td>
                                    <td className="px-4 py-3">{store.type}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{store.code || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${store.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {store.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(store)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteStore(store)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {stores.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                        No stores found.
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
                        <DialogTitle>{editingStore ? 'Edit Store' : 'Add Store'}</DialogTitle>
                        <DialogDescription>
                            {editingStore ? 'Update the details of your store.' : 'Create a new store or warehouse.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editingStore 
                            ? StoreController.update.form(editingStore) 
                            : StoreController.store.form()
                        )}
                        method={editingStore ? 'patch' : 'post'}
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
                                        defaultValue={editingStore?.name}
                                        required
                                        placeholder="Store name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Input
                                        id="type"
                                        name="type"
                                        defaultValue={editingStore?.type}
                                        required
                                        placeholder="e.g. Warehouse, Retail"
                                    />
                                    <InputError message={errors.type} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        defaultValue={editingStore?.code || ''}
                                        placeholder="Store code"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={editingStore?.phone || ''}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        defaultValue={editingStore?.address || ''}
                                        placeholder="Store address"
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="is_active" 
                                        name="is_active"
                                        value="1"
                                        defaultChecked={editingStore ? editingStore.is_active : true} 
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
                                        {editingStore ? 'Update' : 'Create'}
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

StoresIndex.layout = {
    breadcrumbs: [
        {
            title: 'Stores',
            href: index(),
        },
    ],
};
