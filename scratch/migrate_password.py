import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def migrate():
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if "?" in db_url:
        db_url = db_url.split("?", 1)[0]
        
    engine = create_async_engine(db_url, connect_args={"ssl": True})
    
    async with engine.begin() as conn:
        print("Adding password column to researcher_profiles...")
        try:
            await conn.execute(text("ALTER TABLE researcher_profiles ADD COLUMN password TEXT;"))
            print("Successfully added password column.")
        except Exception as e:
            print(f"Error (probably already exists): {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate())
