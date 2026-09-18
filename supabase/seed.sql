-- Initial demo state: DEC-0042 already approved on Supplier A's first offer.

insert into suppliers (id, name, code) values
  ('supplier-a', 'Supplier A', 'SUP-A'),
  ('supplier-b', 'Supplier B', 'SUP-B'),
  ('supplier-c', 'Supplier C', 'SUP-C');

insert into products (id, code, name, unit) values
  ('product-sd-150', 'SD-150', 'Sanding Disc 150mm', 'unit');

-- v1 sources, one per supplier's initial offer
insert into supplier_sources (id, supplier_id, filename, version, status, content_hash) values
  ('00000000-0000-0000-0000-00000000a001', 'supplier-a', 'supplier_A_v1.csv', 1, 'processed', 'seed-a-v1'),
  ('00000000-0000-0000-0000-00000000b001', 'supplier-b', 'supplier_B_v1.csv', 1, 'processed', 'seed-b-v1'),
  ('00000000-0000-0000-0000-00000000c001', 'supplier-c', 'supplier_C_v1.csv', 1, 'processed', 'seed-c-v1');

insert into supplier_offers (supplier_id, product_id, source_id, source_row, quantity, unit_price, currency) values
  ('supplier-a', 'product-sd-150', '00000000-0000-0000-0000-00000000a001', 1, 10000, 2.00, 'EUR'),
  ('supplier-b', 'product-sd-150', '00000000-0000-0000-0000-00000000b001', 1, 10000, 2.30, 'EUR'),
  ('supplier-c', 'product-sd-150', '00000000-0000-0000-0000-00000000c001', 1, 10000, 2.70, 'EUR');

insert into decisions (
  id, product_id, recommended_supplier_id, quantity, unit_price, total_price, currency,
  status, current_version, approved_at, approved_by, source_id
) values (
  'DEC-0042', 'product-sd-150', 'supplier-a', 10000, 2.00, 20000, 'EUR',
  'APPROVED', 1, '2026-09-17 15:42:00+00', 'Procurement Manager', '00000000-0000-0000-0000-00000000a001'
);

insert into decision_versions (
  decision_id, version, supplier_id, quantity, unit_price, total_price, currency, status, source_id
) values (
  'DEC-0042', 1, 'supplier-a', 10000, 2.00, 20000, 'EUR', 'APPROVED', '00000000-0000-0000-0000-00000000a001'
);

insert into evidence (decision_id, decision_version, source_id, source_row, field_name, field_value) values
  ('DEC-0042', 1, '00000000-0000-0000-0000-00000000a001', 1, 'unit_price', '2.00'),
  ('DEC-0042', 1, '00000000-0000-0000-0000-00000000a001', 1, 'quantity', '10000');

insert into approvals (decision_id, decision_version, approved_by, approved_at, status) values
  ('DEC-0042', 1, 'Procurement Manager', '2026-09-17 15:42:00+00', 'APPROVED');

insert into events (event_type, event_key, source_id, decision_id, payload, status, processed_at) values (
  'SUPPLIER_SOURCE_UPDATED', 'supplier_source_updated:supplier-a:seed-a-v1', '00000000-0000-0000-0000-00000000a001',
  'DEC-0042', '{"supplierId":"supplier-a","version":1}', 'COMPLETED', '2026-09-17 09:12:00+00'
);
