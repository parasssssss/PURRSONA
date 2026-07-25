from sqlmodel import SQLModel,create_engine,Session
from pathlib import Path

base_dir=Path(__file__).resolve().parent
db_path=base_dir/"database.db"
sqlite_url=f"sqlite:///{db_path}"

connect_args={"check_same_thread":False}
engine=create_engine(sqlite_url,connect_args=connect_args)
def create_db():
    SQLModel.metadata.create_all(engine)
    
def get_session():
    with Session(engine) as session:
        yield session