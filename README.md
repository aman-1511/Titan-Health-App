# Titan Health App - Documentation

A comprehensive web application that seamlessly combines exercise and nutrition tracking while offering intelligent, personalized suggestions to guide users' health and fitness journeys .



If you are interested in extending or contributing to this project:
1.  Clone the repository
2.  Set up your own MongoDB Atlas database instance.
3.  Configure the required environment variables (see Setup section below).
4.  Follow the development workflow outlined below.

## Setup and Running

### Prerequisites
*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/) (which includes npm)
*   [Yarn](https://yarnpkg.com/): Install globally via npm install --global yarn

### 1. Clone the Repository
Clone the repository:
bash
git clone https://github.com/amanchaudhary/titan-health-app.git
cd titan-health-app


### 2. Install Dependencies
Install dependencies separately for the frontend and backend:
bash
cd backend
yarn install
cd ../frontend
yarn install
cd .. 

*Important:* Always run yarn commands within the /backend or /frontend directories, not the root directory.

### 3. Configure Environment Variables (Backend)
The backend requires environment variables for configuration, particularly for database connection and security.
1.  Navigate to the /backend directory.
2.  Create a .env file by copying the example: cp .env.example .env (or copy manually on Windows).
3.  Edit the .env file and fill in the required values (e.g., MongoDB connection string, JWT secret, encryption key). You will need to:
    *   Set up your own MongoDB Atlas instance ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).
    *   Create a strong secret key for JWT and data encryption.
    *   Configure any other necessary variables as per .env.example.

### 4. Run the Application
You need two separate terminals to run the backend and frontend concurrently.

*   *Terminal 1: Run Backend Server*
    bash
    cd backend
    yarn start 
    

*   *Terminal 2: Run Frontend Client*
    bash
    cd frontend
    yarn start
    

The frontend application should now be accessible at http://localhost:3000 (or the next available port).

## Development Workflow

### Installing New Dependencies
Navigate to the /frontend or /backend directory and use Yarn:
bash
# Install a production dependency
yarn add <package-name>

# Install a development dependency
yarn add --dev <package-name>


### Git Workflow
1.  *Pull Changes:* Before starting work or pushing, ensure your local branch is up-to-date:
    bash
    git checkout main # Or your working branch
    git pull origin main --rebase 
    
    *(Using --rebase is recommended to maintain a cleaner Git history, but optional)*
2.  *Commit Changes:* Make your changes and commit them with a clear message:
    bash
    git add .
    git commit -m "Your descriptive commit message"
    
3.  *Push Changes:* Push your changes:
    bash
    git push origin <your-branch-name>
    
4.  *Create Pull Request:* If you're a contributor, open a pull request from your branch to the main branch of the repository.

## Bugs
*   Health trackers have some issues when rendering the graphs and entering new entries.

## Future Updates and Goals
*   Improve UI and visual experience for users.
*   Create more comprehensive recommendation system
*   Create more useful health and fitness features, as most features are skewed towards nutrition currently.
*   Improve robustness and user input validation of application on some pages.

## Screenshots
Below are screenshots of some of the pages within our site as a preview! *Note that many of the pages in the site our not shown (such as the fitness and health tracker related pages)*, and these are just a showcase of some of the UI.

#### Meal Tracker Page
<img width="1438" alt="Image" src="https://github.com/user-attachments/assets/2d80d349-9e48-472b-acb0-7077eb9ee799" />

#### Dining Court Menu Page
<img width="1437" alt="Image" src="https://github.com/user-attachments/assets/e79c018a-8364-4205-8f59-3f2185732c24" />

#### Dining Court Menu Item Page
<img width="1440" alt="Image" src="https://github.com/user-attachments/assets/fda6daed-14ba-44ad-8d67-467ad1b6a376" />

#### Dietary Preferences Page
<img width="1440" alt="Image" src="https://github.com/user-attachments/assets/4f07bb9a-a4fa-4d4f-9795-2707b248b437" />

#### Home Page


#### Recommended Menu Items Page
<img width="1432" alt="Image" src="https://github.com/user-attachments/assets/f8c773b8-b266-487f-b76d-dfd7104a6ebb" />

#### Other Health Tracker Page - Weight 
<img width="1437" alt="Image" src="https://github.com/user-attachments/assets/635daea2-42aa-45d8-af3e-60ff103ac2ee" />
