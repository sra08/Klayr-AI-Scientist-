import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def run_migration():
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    if "?" in db_url:
        base_url, query = db_url.split("?", 1)
        db_url = base_url

    engine = create_async_engine(
        db_url,
        connect_args={"ssl": True} if "neon.tech" in db_url else {}
    )

    async with engine.begin() as conn:
        print("Adding user_id column to experiment_plans...")
        try:
            await conn.execute(text("ALTER TABLE experiment_plans ADD COLUMN user_id UUID;"))
            print("Successfully added user_id column.")
        except Exception as e:
            print(f"Error (maybe column already exists?): {e}")
        
        print("Creating index on user_id...")
        try:
            await conn.execute(text("CREATE INDEX idx_experiment_plans_user_id ON experiment_plans(user_id);"))
            print("Successfully created index.")
        except Exception as e:
            print(f"Error: {e}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_migration())
