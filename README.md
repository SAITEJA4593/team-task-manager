--------------------------------------------------------------------------
*📌 TEAM TASK MANAGER (FULL-STACK WEB APPLICATION)*
==========================================================================

This is a professional full-stack project management web application. It helps teams create projects, assign tasks to members, and track status live. The app has separate dashboards for Admins and Members (Role-Based Access Control) to keep data secure.

The entire application is completely live and running on Railway Cloud.

--------------------------------------------------------------------------
🚀 KEY FEATURES
--------------------------------------------------------------------------
* Secure Authentication: Users can sign up and log in safely. Passwords are securely encrypted using BcryptJS.
* Role-Based Access Control (RBAC):
  - Admins can create new projects, create tasks, and assign them to any team member.
  - Members can only view tasks assigned to them and update the task status.
* Live Analytics Summary: Real-time counters showing Total Tasks, Pending Tasks, and Completed Tasks on top of the dashboard.
* Search & Filter Engine: Users can search for tasks by name or project, and filter them instantly based on status (Pending, In Progress, Completed).
* Proper Layout Alignment: Clean, structured interface with easy user navigation.

--------------------------------------------------------------------------
🛠️ TECH STACK USED
--------------------------------------------------------------------------
* Backend Engine: Node.js with Express.js framework
* Database: Cloud PostgreSQL (Hosted on Railway)
* Security: JSON Web Tokens (JWT) for secure session tokens & BcryptJS for password hashing
* Frontend UI: HTML5, CSS3 (with responsive layouts), and Vanilla JavaScript (Fetch API)
* Hosting Platform: Railway Cloud Platform

--------------------------------------------------------------------------
⚙️ HOW TO SETUP AND RUN LOCALLY
--------------------------------------------------------------------------
Follow these simple steps to run this project on your local computer:

1. Clone the repository:
   git clone https://github.com/SAITEJA4593/team-task-manager.git

2. Install required packages:
   npm install

3. Setup your Environment Variables:
   Create a file named .env in the root folder and add your credentials:
   PORT=5000
   DATABASE_URL=your_postgresql_database_url
   JWT_SECRET=your_super_secret_key

4. Create Database Tables Automatically:
   node initDb.js

5. Start the development server:
   npm run dev

Now, open your browser and go to: http://localhost:5000/index.html

--------------------------------------------------------------------------
📂 DATABASE SCHEMA DESIGN
--------------------------------------------------------------------------
The project uses a relational database model with three properly linked tables:
1. Users Table: Stores Name, Email, Hashed Password, and Role (Admin / Member).
2. Projects Table: Stores Project Name, linked to the Admin who created it.
3. Tasks Table: Stores Task Title, Status (Pending, In Progress, Completed), Due Date, linked to a specific Project ID and assigned to a User ID.

--------------------------------------------------------------------------
*Built by saiteja gundeti for ethara ai nomination form*
==========================================================================
