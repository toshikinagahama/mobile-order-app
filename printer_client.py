import socketio

# Create a Socket.IO client instance
sio = socketio.Client()

@sio.event
def connect():
    print('Connected to Socket Server')
    sio.emit('join_room', 'admin') # Join admin room just in case, or listen to global broadcasts

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print('Disconnected from server')

@sio.on('print_order')
def on_print_order(data):
    print('--- NEW ORDER RECEIVED ---')
    print(f"Table ID: {data.get('tableId')}")
    items = data.get('items', [])
    for item in items:
        # Check structure: might be { productId, quantity } or hydrated
        # Ideally, we should fetch product details or send them from frontend
        print(f" - Product ID: {item.get('productId')}, Qty: {item.get('quantity')}")
    print('--------------------------')
    # Here you would add the thermal printer code (e.g., using python-escpos)

if __name__ == '__main__':
    try:
        # Connect to the standalone socket server
        sio.connect('http://localhost:3001')
        sio.wait()
    except Exception as e:
        print(f"Error: {e}")
