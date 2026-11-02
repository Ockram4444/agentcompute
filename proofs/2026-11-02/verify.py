#!/usr/bin/env python3
"""Verify bundle integrity and recompute synthetic invoice totals locally."""
from pathlib import Path
from collections import defaultdict
from decimal import Decimal
import csv, hashlib, json
root=Path(__file__).resolve().parent
manifest=json.loads((root/'manifest.json').read_text())
for name,expected in manifest['sha256'].items():
    actual=hashlib.sha256((root/name).read_bytes()).hexdigest()
    assert actual==expected, 'Hash mismatch: '+name
rows=list(csv.DictReader((root/'inputs/invoices.csv').open()))
assert len(rows)==120
totals=defaultdict(Decimal)
for row in rows:
    totals[row['supplier']]+=Decimal(row['amount_usd'])
actual_rows=list(csv.DictReader((root/'outputs/supplier_totals.csv').open()))
assert len(actual_rows)==6
actual={r['supplier']:Decimal(r['total_usd']) for r in actual_rows}
assert len(actual)==6 and dict(totals)==actual
for name,expected_status,expected_time in [('spend-01','failed','29.906'),('research-01','succeeded','64.614'),('spend-02','succeeded','17.999')]:
    job=json.loads((root/'runs'/f'{name}.json').read_text())['job']
    assert job['status']==expected_status
    assert Decimal(str(job['timings']['server_total_seconds']))==Decimal(expected_time)
print('PASS: bundle hashes; 120 invoice rows; all six supplier totals; recorded statuses and timing fields.')
print('This verifies published records, not provider hardware, live performance, or current external prices.')
