I need some adjustments in the products, purchase order, purchase order recipients (GRN process).
I have removed the cost column from product_variants table, I don't need this, Just only price is enough to add products
database/migrations/2026_06_15_134921_create_product_variants_table.php
While create a purchase orders, I need some fields to keep records extra cost apart from the purchase cost, Added 2 new columns in this migration names are
custom_duty, other_cost so add 2 new fields in the UI form as well.
database/migrations/2026_06_15_134921_create_purchase_orders_table.php
I renamed the cost column to purchase_price into this table, so adjust code accordingly
Migration files is database/migrations/2026_06_15_134922_create_purchase_order_items_table.php
While creating GRN that time show these 3 fields in the shipping_cost, custom_duty, other_cost from the purchase orders table, 
user can override them
migration path  database/migrations/2026_06_18_025822_create_pur_chase_order_receipts_table.php
In the GRN create window Keep the option to take decision about the cost(shipping_cost, custom_duty, other_cost) wil be split into item wise or unit wise 
Based on the input the cost will be store into the receipt_items table unit wise and total_cost_price column will be accepted_qty * (unit_purchase_cost_price + unit_shipping_cost+ unit_custom_duty + unit_other_cost),
So that I can easily set sell rate later from it.
reference table is
database/migrations/2026_06_18_025842_create_pur_chase_order_receipt_items_table.php