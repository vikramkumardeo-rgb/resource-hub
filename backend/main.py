from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Resource Hub API is running"}

@app.get("/resources")
def list_resources():
    return [
        {"ID": 1, "title": "Clean Architecture", "Type": "Book"},
        {"ID": 2, "title": "Introduction to FastAPI", "Type": "Article"},
    ]