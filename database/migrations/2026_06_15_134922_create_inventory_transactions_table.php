<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('store_id')->constrained('stores')->restrictOnDelete();
            $table->foreignId('variant_id')->constrained('product_variants')->restrictOnDelete();
            $table->foreignId('purchase_order_receipt_id')->constrained('purchase_order_receipts')->restrictOnDelete();
            $table->string('transaction_type');
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->integer('qty_in')->default(0);
            $table->integer('qty_out')->default(0);
            $table->decimal('unit_purchase_cost_price', 15, 2)->default(0);
            $table->decimal('unit_shipping_cost', 15, 2)->default(0);
            $table->decimal('unit_custom_duty', 15, 2)->default(0);
            $table->decimal('unit_other_cost', 15, 2)->default(0);
            $table->decimal('total_cost_price', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('date');
            $table->index('store_id');
            $table->index('purchase_order_receipt_id');
            $table->index('variant_id');
            $table->index('transaction_type');
            $table->index(['reference_type', 'reference_id'], 'inv_tx_ref_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
