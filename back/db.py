import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
DB_NAME = "rds-prod-cse-406"
DATABASE_URL_DEFAULT = DATABASE_URL.rsplit("/", 1)[0] + "/postgres"

engine_default = create_engine(DATABASE_URL_DEFAULT, isolation_level="AUTOCOMMIT")

with engine_default.connect() as conn:
    result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{DB_NAME}'"))
    exists = result.scalar()
    
    if not exists:
        conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
        print(f"Database '{DB_NAME}' created successfully!")
    else:
        print(f"Database '{DB_NAME}' already exists.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
