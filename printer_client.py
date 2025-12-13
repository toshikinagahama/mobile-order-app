import time
import sqlite3
import datetime

import os

# Configuration
# Determine DB path dynamically to work both in Docker and locally
if os.path.exists('/app/prisma/dev.db'):
    DB_PATH = '/app/prisma/dev.db'
else:
    # Fallback to local path relative to this script
    DB_PATH = os.path.join(os.path.dirname(__file__), 'prisma/dev.db')

POLL_INTERVAL = 1  # seconds

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

import json

def poll_for_jobs():
    conn = get_db_connection()
    try:
        # Enable WAL
        conn.execute('PRAGMA journal_mode=WAL;')
        
        cursor = conn.cursor()
        
        # Fetch unprinted jobs
        query = "SELECT id, type, payload, createdAt FROM PrintJob WHERE isPrinted = 0 ORDER BY id ASC"
        cursor.execute(query)
        jobs = cursor.fetchall()
        
        if jobs:
            print(f"--- Found {len(jobs)} new jobs ---")
            
            for job in jobs:
                job_id = job['id']
                job_type = job['type']
                payload_str = job['payload']
                created_at = job['createdAt']
                
                try:
                    payload = json.loads(payload_str)
                    table_name = payload.get('tableName', 'Unknown Table')
                    
                    if job_type == 'ORDER':
                        print_order_ticket(table_name, payload.get('items', []), created_at)
                    elif job_type == 'BILL':
                        print_bill_request(table_name, created_at)
                    else:
                        print(f"[Unknown Job Type] {job_type}: {payload}")
                        
                    # Mark as printed
                    conn.execute("UPDATE PrintJob SET isPrinted = 1 WHERE id = ?", (job_id,))
                    conn.commit()
                    
                except json.JSONDecodeError:
                    print(f"Error decoding payload for job {job_id}")
                except Exception as e:
                    print(f"Error processing job {job_id}: {e}")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        conn.close()

def print_order_ticket(table_name, items, timestamp):
    print("==========================")
    print("      NEW ORDER")
    print(f"Table: {table_name}")
    print(f"Time: {timestamp}")
    print("--------------------------")
    for item in items:
        print(f" - {item['name']} x{item['quantity']}")
    print("==========================\n")

def print_bill_request(table_name, timestamp):
    print("##########################")
    print("    BILL REQUEST")
    print(f"Table: {table_name}")
    print(f"Time: {timestamp}")
    print("##########################\n")

if __name__ == '__main__':
    print("Printer polling service started (PrintJob Mode)...")
    
    while True:
        poll_for_jobs()
        time.sleep(POLL_INTERVAL)
