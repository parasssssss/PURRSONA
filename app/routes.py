from fastapi import APIRouter,Depends
from pathlib import Path 
from pydantic import BaseModel
from typing import List
from database import get_session
from sqlmodel import Session,select
from model import CatPersonality
import random
import json 

project_root=Path(__file__).resolve().parent.parent
json_path=project_root/"data"/"Question.json"
with open(json_path,'r') as f:
    questions=json.load(f)

router=APIRouter()

# I need to make an GET API endpoint that selects five  questions from the json file at random. 
# using random.sample() helps in selecting ramdom questions from the json data 
@router.get("/questions" ,tags=['Questions'])
def get_questions():
    return random.sample(questions,5) 


class answer_item(BaseModel):
    ques_id:int
    answers:str
class quizpayload(BaseModel):
    responses:List[answer_item]
 
question_map={}
for q in questions:
    key=q["id"]
    value=q
    question_map[key]=value
   
@router.post("/results",tags=["Results"])
def calculate_personalities(payload:quizpayload,
                            session:Session=Depends(get_session)):
    
    scoreboard={
    "CHAOTIC": 0,
    "CONFUSED": 0,
    "SLEEPY": 0,
    "CHILL": 0,
    "GRUMPY": 0,
    "GOOFY": 0,
    "JUDGMENTAL": 0,
    "MISCHIEVOUS": 0,
    "FREAKY": 0
    }
    
    for items in payload.responses:
        current_question=question_map[items.ques_id]
        for answer in current_question["answers"]:
            if answer["text"]==items.answers:
                current_score=answer["scores"]
                for category,points in current_score.items():
                    scoreboard[category]=scoreboard[category]+points
                break
    
    winning_category=max(scoreboard,key=scoreboard.get) #Learned about max() in dict


    cat=session.exec(
        select(CatPersonality).where(CatPersonality.category==winning_category) ).first()
    
    return cat
        
           
            
            
            
    




    
    




