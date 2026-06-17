import { Form, Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useState } from 'react';
import SupplierController from '@/actions/App/Http/Controllers/Crm/SupplierController';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination, { type PaginationData } from '@/components/pagination';
import TableSkeleton from '@/components/table-skeleton';
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
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/suppliers';
import type { Supplier } from '@/types';

export default function SuppliersIndex({ suppliers }: { suppliers?: PaginationData<Supplier> }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const openCreateDialog = () => {
        setEditingSupplier(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsDialogOpen(true);
    };

    return (
        <>
            <Head title="Suppliers" />

            <div className="space-y-6 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Suppliers"
                        description="Manage your supplier relationships"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">#</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Contact Person</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {!suppliers ? (
                                <TableSkeleton rows={10} columns={7} />
                            ) : (
                                <>
                                    {suppliers.data.map((supplier, index) => (
                                        <tr key={supplier.id}>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {suppliers.from + index}
                                            </td>
                                            <td className="px-4 py-3">{supplier.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{supplier.contact_person || '-'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{supplier.phone || '-'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{supplier.email || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${supplier.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(supplier)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmationDialog
                                                        action={SupplierController.destroy(supplier)}
                                                        title="Delete supplier?"
                                                        description={`This will permanently delete "${supplier.name}".`}
                                                        confirmLabel="Delete supplier"
                                                        processingLabel="Deleting supplier..."
                                                    >
                                                        <Button variant="ghost" size="icon">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                            <span className="sr-only">Delete {supplier.name}</span>
                                                        </Button>
                                                    </DeleteConfirmationDialog>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {suppliers.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No suppliers found.
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                    {suppliers && suppliers.total > suppliers.per_page && (
                        <Pagination
                            links={suppliers.links}
                            from={suppliers.from}
                            to={suppliers.to}
                            total={suppliers.total}
                        />
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
                        <DialogDescription>
                            {editingSupplier ? 'Update the details of your supplier.' : 'Create a new supplier record.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editingSupplier
                            ? SupplierController.update.form(editingSupplier)
                            : SupplierController.store.form()
                        )}
                        method={editingSupplier ? 'patch' : 'post'}
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
                                        defaultValue={editingSupplier?.name}
                                        required
                                        placeholder="Supplier name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        name="contact_person"
                                        defaultValue={editingSupplier?.contact_person || ''}
                                        placeholder="Contact person name"
                                    />
                                    <InputError message={errors.contact_person} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={editingSupplier?.phone || ''}
                                        placeholder="Phone number"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={editingSupplier?.email || ''}
                                        placeholder="Email address"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        defaultValue={editingSupplier?.address || ''}
                                        placeholder="Supplier address"
                                        rows={3}
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        name="is_active"
                                        value="1"
                                        defaultChecked={editingSupplier ? editingSupplier.is_active : true}
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
                                        {editingSupplier ? 'Update' : 'Create'}
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

SuppliersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Suppliers',
            href: index(),
        },
    ],
};
