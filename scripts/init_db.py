import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("DATABASE_URL not found in environment")
        return

    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Sanitize URL for asyncpg
    if "?" in db_url:
        db_url = db_url.split("?", 1)[0]

    engine = create_async_engine(
        db_url,
        connect_args={"ssl": True} if "neon.tech" in db_url else {}
    )

    migration_path = os.path.join(os.path.dirname(__file__), "migration.sql")
    with open(migration_path, "r") as f:
        sql_commands = f.read()

    async with engine.begin() as conn:
        # Split by semicolon to run commands individually, but be careful with functions/triggers
        # For this specific migration.sql, it should be fine to run as one block if supported,
        # or split by semi-colon.
        
        # asyncpg's execute() can handle multiple statements if they don't return rows.
        # But let's split it just in case, or use a simpler approach.
        print("Running migration...")
        for command in sql_commands.split(";"):
            cmd = command.strip()
            if cmd:
                await conn.execute(text(cmd))
        print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(init_db())
