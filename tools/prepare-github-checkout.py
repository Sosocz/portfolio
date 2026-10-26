#!/usr/bin/env python3
"""Reconstitue la géométrie brute depuis sa copie gzip, sans perte."""
from pathlib import Path
import gzip
import hashlib
import os

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "dist/chambre-sxsx/chambre-sxsx.bin"
EXPECTED = "cfb9f17f99c1fef33b4178f622edfe39f4704ffeb18a00347243ff5144ea9d2d"

def prepare():
    if TARGET.exists() and hashlib.sha256(TARGET.read_bytes()).hexdigest() == EXPECTED:
        print("Géométrie déjà prête et vérifiée.")
        return
    data = gzip.decompress(TARGET.with_suffix(".bin.gz").read_bytes())
    if hashlib.sha256(data).hexdigest() != EXPECTED:
        raise SystemExit("Copie gzip invalide : aucun fichier remplacé.")
    temp = TARGET.with_suffix(".bin.preparing")
    temp.write_bytes(data)
    os.replace(temp, TARGET)
    print(f"Géométrie reconstituée et vérifiée : {len(data):,} octets.")

if __name__ == "__main__":
    prepare()
