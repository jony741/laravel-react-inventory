<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_order_receipts', function (Blueprint $table) {
            $table->id();

            $table->string('grn_number')->unique();

            $table->foreignId('purchase_order_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('store_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('received_date');

            $table->foreignId('received_by')
                ->constrained('users');

            $table->string('supplier_invoice_no')->nullable();
            $table->date('supplier_invoice_date')->nullable();

            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('custom_duty', 15, 2)->default(0);
            $table->decimal('other_cost', 15, 2)->default(0);

            $table->enum('status', [
                'DRAFT',
                'COMPLETED',
            ])->default('DRAFT');

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pur_chase_order_receipts');
    }
};
