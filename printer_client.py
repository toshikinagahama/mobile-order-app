from escpos.printer import Usb
import numpy
import os
import json

import PIL.Image
import PIL.ImageDraw
import PIL.ImageFont
import time
import sqlite3
import datetime

PRINTER_WIDTH = 380
FONT_PATH = "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"
DB_PATH = '../mobile-order-app/prisma/dev.db'
POLL_INTERVAL = 1  # seconds


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def getHeight(text):
    height = 0
    # ここでダミーのimgを作成してDrawオブジェクトを作らないとエラーになることがあります
    dummy_img = PIL.Image.new("RGBA", (1, 1))
    draw = PIL.ImageDraw.Draw(dummy_img)
    font = PIL.ImageFont.truetype(FONT_PATH, 32)
    #改行で区切る
    textList = text.split("\n")
    for t in textList:
        bbox = font.getbbox(t)
        num_devide = (bbox[2] - bbox[0]) // PRINTER_WIDTH + 1
        #print(num_devide)
        if(num_devide > 1):
            offset = 0
            for i in range(len(t)):
                sub_t  = t[offset:i]
                tbbox = font.getbbox(sub_t)
                num_devide2 = (tbbox[2] - tbbox[0]) // PRINTER_WIDTH + 1
                if(num_devide2 > 1):
                    offset = i -1
                    #print(sub_t[:-1])
                    h = tbbox[3] - tbbox[1] 
                    height += h + 5 # 少し行間を足す
            if(len(t[offset:]) > 0):
                bbox = font.getbbox(t[offset:])
                h = bbox[3] - bbox[1] 
                height += h + 5 # 少し行間を足す
        else:
            #からの場合があるのでそのときあはAとして足す。
            if(len(t) == 0):
                h = font.getbbox("A")[3] - font.getbbox("A")[1] 
                height += h + 5 # 少し行間を足す
            else:
                h = bbox[3] - bbox[1] 
                height += h + 5 # 少し行間を足す

    return height

def draw_text(img, text):
    draw = PIL.ImageDraw.Draw(img)
    font = PIL.ImageFont.truetype(FONT_PATH, 32)
    text2 = ""
    #改行で区切る
    textList = text.split("\n")
    for t in textList:
        bbox = font.getbbox(t)
        num_devide = (bbox[2] - bbox[0]) // PRINTER_WIDTH + 1
        if(num_devide > 1):
            offset = 0
            for i in range(len(t)):
                sub_t  = t[offset:i]
                tbbox = font.getbbox(sub_t)
                num_devide2 = (tbbox[2] - tbbox[0]) // PRINTER_WIDTH + 1
                if(num_devide2 > 1):
                    offset = i -1
                    text2 += sub_t[:-1] + "\n"
            if(len(t[offset:]) > 0):
                bbox = font.getbbox(t[offset:])
                text2 += t[offset:] + "\n"
        else:
            text2 += t + "\n"
    draw.text((0, 0), text2, font=font, fill=(0, 0, 0))
def poll_for_jobs():
    conn = get_db_connection()
    try:
        conn.execute('PRAGMA journal_mode=DELETE;')
        cursor = conn.cursor()
        query = "SELECT id, type, payload, createdAt FROM PrintJob WHERE isPrinted = 0 ORDER BY id ASC"
        cursor.execute(query)
        jobs = cursor.fetchall()
        
        if jobs:
            p = Usb(0x0416, 0x5011, out_ep=3)
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
                        res = print_order_ticket(table_name, payload.get('items', []), created_at)
                    elif job_type == 'BILL':
                        res = print_bill_request(table_name, created_at)
                    else:
                        print(f"[Unknown Job Type] {job_type}: {payload}")
                    
                    height = getHeight(res)
                    print(f"Calculated Height: {height}")
                    
                    # 計算した高さでキャンバスを作成
                    img = PIL.Image.new("RGBA", (PRINTER_WIDTH, int(height)), (255, 255, 255, 255)) # 背景白に設定
                    draw_text(img, res)
                    
                    path = os.path.dirname(os.path.abspath(__file__))
                    
                    # ディレクトリがない場合のエラーを防ぐ
                    output_dir = os.path.join(path, "output")
                    if not os.path.exists(output_dir):
                        os.makedirs(output_dir)
                        
                    filename = output_dir + "/test_textDraw.png"

                    img.save(filename, "PNG")
                    # プリンタオブジェクトがあれば印刷
                    if 'p' in locals():
                        try:
                            # === 印刷実行 ===
                            print("印刷データを送信中...")
                            p.image(filename)
                            p.text("\n\n\n\n")
                        except Exception as e:
                            print(f"Print error: {e}")

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
    #タイムスタンプを時間分に変換
    hour = datetime.datetime.fromtimestamp(timestamp/1000).hour
    minute = datetime.datetime.fromtimestamp(timestamp/1000).minute
    second = datetime.datetime.fromtimestamp(timestamp/1000).second
    res = ""
    res += "========================"
    res += "      NEW ORDER\n"
    res += "Table: " + str(table_name) + "\n"
    res += "Time: " + f"{str(hour).zfill(2)}:{str(minute).zfill(2)}:{str(second).zfill(2)}" + "\n"
    res += "------------------------\n"
    for item in items:
        res += " - " + str(item['name']) + " x" + str(item['quantity']) + "\n"
    res += "========================\n"
    print(res)
    return res

def print_bill_request(table_name, timestamp):
    hour = datetime.datetime.fromtimestamp(timestamp/1000).hour
    minute = datetime.datetime.fromtimestamp(timestamp/1000).minute
    second = datetime.datetime.fromtimestamp(timestamp/1000).second
    res = ""
    res += "########################\n"
    res += "    BILL REQUEST\n"
    res += "Table: " + str(table_name) + "\n"
    res += "Time: " + f"{str(hour).zfill(2)}:{str(minute).zfill(2)}:{str(second).zfill(2)}" + "\n"
    res += "########################\n\n"     
    print(res)
    return res

if __name__ == '__main__':
    print("Printer polling service started (PrintJob Mode)...")
    
    while True:
        poll_for_jobs()
        time.sleep(POLL_INTERVAL)
