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
        Schema::create('purchase_order_receipt_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('purchase_order_receipt_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('purchase_order_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('product_variant_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->integer('ordered_qty');
            $table->integer('received_qty');

            $table->integer('accepted_qty')->default(0);
            $table->integer('rejected_qty')->default(0);

            $table->decimal('unit_cost', 15, 2);

            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();

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
        Schema::dropIfExists('pur_chase_order_receipt_items');
    }
};
