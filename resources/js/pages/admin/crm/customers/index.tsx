import { Form, Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import CustomerController from '@/actions/App/Http/Controllers/Crm/CustomerController';
import DeleteConfirmationDialog from '@/components/delete-confirmation-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import Pagination, { type PaginationData } from '@/components/pagination';
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
import { index } from '@/routes/customers';
import type { Customer } from '@/types';

export default function CustomersIndex({ customers }: { customers: PaginationData<Customer> }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const openCreateDialog = () => {
        setEditingCustomer(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsDialogOpen(true);
    };

    return (
        <>
            <Head title="Customers" />

            <div className="space-y-6 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Customers"
                        description="Manage your customer relationships"
                    />
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </div>

                <div className="rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">#</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {customers.data.map((customer, index) => (
                                <tr key={customer.id}>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {customers.from + index}
                                    </td>
                                    <td className="px-4 py-3">{customer.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{customer.phone || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{customer.email || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${customer.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {customer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <DeleteConfirmationDialog
                                                action={CustomerController.destroy(customer)}
                                                title="Delete customer?"
                                                description={`This will permanently delete "${customer.name}".`}
                                                confirmLabel="Delete customer"
                                                processingLabel="Deleting customer..."
                                            >
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Delete {customer.name}</span>
                                                </Button>
                                            </DeleteConfirmationDialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {customers.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {customers.total > customers.per_page && (
                        <Pagination
                            links={customers.links}
                            from={customers.from}
                            to={customers.to}
                            total={customers.total}
                        />
                    )}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
                        <DialogDescription>
                            {editingCustomer ? 'Update the details of your customer.' : 'Create a new customer record.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editingCustomer
                            ? CustomerController.update.form(editingCustomer)
                            : CustomerController.store.form()
                        )}
                        method={editingCustomer ? 'patch' : 'post'}
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
                                        defaultValue={editingCustomer?.name}
                                        required
                                        placeholder="Customer name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={editingCustomer?.phone || ''}
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
                                        defaultValue={editingCustomer?.email || ''}
                                        placeholder="Email address"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        defaultValue={editingCustomer?.address || ''}
                                        placeholder="Customer address"
                                        rows={3}
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        name="is_active"
                                        value="1"
                                        defaultChecked={editingCustomer ? editingCustomer.is_active : true}
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
                                        {editingCustomer ? 'Update' : 'Create'}
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

CustomersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Customers',
            href: index(),
        },
    ],
};
