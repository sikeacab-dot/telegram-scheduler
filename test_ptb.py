import asyncio
from telegram import Bot

async def main():
    print("Testing PTB core...")
    # Just checking imports and basic object creation
    bot = Bot("123456:FAKE_TOKEN")
    print(f"Bot object created: {bot}")

if __name__ == "__main__":
    asyncio.run(main())
