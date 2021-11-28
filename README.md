# CS594 - Big Data Visualization Final Project

## Dependencies:
- Python 3.9
- Node 16
- Angular 13

## Instructions to Run the project

__Step 1__: Clone the Project
```
git clone https://github.com/uic-big-data/fall-2021-assignment-2-laxmena.git
cd BIG_DATA_VIS
```

Note: Step 2 is Optional, as the dist file is already uploaded in the repository

__Step 2__: Build the Angular Project
```
cd vis
npm install
ng build --watch
```
This will generate a dist folder in the `vis\` directory

__Step 3__: Install Python Dependencies using Conda package manager

In a new terminal:
```
cd ..
pip install -r requirements.txt
```

__Step 4__: Run python server
```
python server.py
```

__Step 5__: In localweb browser open the url `http://localhost:8080/` (default port: 8080)

__Step 6__: Once you see the following webpage, use mouse pointer to draw a polygon of your interest.

