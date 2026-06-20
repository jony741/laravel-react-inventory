<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();
            $table->foreignId('supplier_id')->constrained('suppliers')->restrictOnDelete();
            $table->foreignId('store_id')->constrained('stores')->restrictOnDelete();
            $table->date('order_date');
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('custom_duty', 15, 2)->default(0);
            $table->decimal('other_cost', 15, 2)->default(0);
            $table->string('payment_status')->default('UNPAID'); // UNPAID, PARTIAL, PAID
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('discount_type')->default('FIXED'); // FIXED or PERCENT
            $table->string('supplier_invoice_number')->nullable();
            $table->date('expected_date')->nullable();
            $table->date('received_date')->nullable();
            $table->date('supplier_invoice_date')->nullable();
            $table->enum('status', [
                'DRAFT',
                'APPROVED',
                'PARTIALLY_RECEIVED',
                'RECEIVED',
                'CLOSED',
                'CANCELLED',
            ])->default('DRAFT');
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('tax', 14, 2)->default(0);
            $table->decimal('discount', 14, 2)->default(0);
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('order_date');
            $table->index('supplier_id');
            $table->index('store_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
