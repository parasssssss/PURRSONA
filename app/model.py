from sqlmodel import Field,Session,SQLModel,create_engine

class CatPersonality(SQLModel,table=True):
    id:int|None=Field(default=None,primary_key=True)
    display_name:str
    category:str
    title:str
    description:str
    image_path:str
    gif_path:str