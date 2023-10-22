import os
import json
import asyncio
from channels.routing import ProtocolTypeRouter
from channels.generic.websocket import AsyncWebsocketConsumer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class FileFollowerEventHandler(FileSystemEventHandler):
    def __init__(self, send_func, event_loop):
        self.send_func = send_func
        self.event_loop = event_loop
        super().__init__()

    def on_modified(self, event):
        self.send_func(event.src_path)


class TerminalConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        self.observer = None
        self.event_handler = None
        self.file_position = None
        self.event_loop = asyncio.get_event_loop()
        super().__init__(*args, **kwargs)

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        if self.observer:
            self.observer.stop()
            self.observer.join()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        file_path = text_data_json['file_path']

        if self.observer:
            self.observer.stop()
            self.observer.join()

        self.event_handler = FileFollowerEventHandler(self.send_lines, self.event_loop)
        self.observer = Observer()
        self.observer.schedule(self.event_handler, path=file_path, recursive=False)
        self.observer.start()

        # Reset the file position
        self.file_position = 0

    def send_lines(self, file_path):
        # Open the file in binary mode for byte-accurate seeking
        try:
            with open(file_path, 'rb') as file:
                # Seek to the last known position
                file.seek(self.file_position)
                # Read to the end of the file
                lines = file.readlines()
                # Remember the current position for next time
                self.file_position = file.tell()

        # Convert the lines to text and send them
            for line in lines:
                text_line = line.decode()
                asyncio.run_coroutine_threadsafe(self.send_delayed(text_data=json.dumps({'message': text_line})), self.event_loop)

        except Exception as e:
            pass

    async def send_delayed(self, text_data):
        await asyncio.sleep(0.05)  # Wait for 50ms
        await self.send(text_data=text_data)
