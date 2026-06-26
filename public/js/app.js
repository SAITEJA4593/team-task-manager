const API_URL = window.location.origin + '/api';

let token = localStorage.getItem('token');
let user = null;
let globalTasksCache = []; 

try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) user = JSON.parse(rawUser);
} catch (e) {
    localStorage.clear();
}

// Simple security router checking
const currentPath = window.location.pathname;
if (currentPath.includes('dashboard.html')) {
    if (!token || !user) {
        window.location.href = 'index.html';
    } else {
        document.addEventListener('DOMContentLoaded', startDashboardPage);
    }
}

function showPopupMessage(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.innerText = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
}

function showAlertMessage(elementId, msg, show = true) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (show) {
        el.innerText = msg;
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // LOGIN ACTION
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showAlertMessage('errorBox', '', false);

            const emailInput = document.getElementById('email').value.trim();
            const passwordInput = document.getElementById('password').value;

            if (!emailInput || !passwordInput) {
                return showAlertMessage('errorBox', 'Please enter both email and password.');
            }

            try {
                const res = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailInput, password: passwordInput })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    showAlertMessage('errorBox', data.message || 'Wrong email or password.');
                }
            } catch (err) {
                showAlertMessage('errorBox', 'Server connection error. Please try again.');
            }
        });
    }

    // REGISTER ACTION
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showAlertMessage('regErrorBox', '', false);

            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value;
            const role = document.getElementById('regRole').value;

            if (!name || !email || !password || !role) {
                return showAlertMessage('regErrorBox', 'Please fill all the boxes.');
            }
            if (password.length < 6) {
                return showAlertMessage('regErrorBox', 'Password must be at least 6 characters long.');
            }

            try {
                const res = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('Registration complete! Click OK to go to login page.');
                    window.location.href = 'index.html';
                } else {
                    showAlertMessage('regErrorBox', data.message || 'Registration failed.');
                }
            } catch (err) {
                showAlertMessage('regErrorBox', 'Server error. Please try again later.');
            }
        });
    }

    // LOGOUT ACTION
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

async function startDashboardPage() {
    if (!user) return;
    
    document.getElementById('welcomeTitle').innerText = `Welcome, ${user.name}`;
    const badge = document.getElementById('roleBadge');
    badge.innerText = `${user.role}`;
    badge.className = `badge ${user.role}`;

    if (user.role === 'Admin') {
        document.getElementById('adminPanel').style.display = 'block';
        setupAdminActions();
        loadAdminDropdownOptions();
    }

    document.getElementById('taskSearchInput').addEventListener('input', renderFilteredTasks);
    document.getElementById('statusFilterSelector').addEventListener('change', renderFilteredTasks);
    
    fetchAndDisplayTasks();
}

function setupAdminActions() {
    // Project Form
    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('projName');
        const nameVal = input.value.trim();

        try {
            const res = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: nameVal })
            });

            if (res.ok) {
                alert('New project created successfully!');
                input.value = '';
                loadAdminDropdownOptions();
            }
        } catch (err) {
            alert('Error connecting to server.');
        }
    });

    // Task Form
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value.trim();
        const project_id = document.getElementById('taskProject').value;
        const assigned_to = document.getElementById('taskUser').value;
        const due_date = document.getElementById('taskDue').value;

        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, project_id, assigned_to, due_date })
            });

            if (res.ok) {
                alert('Task assigned to member successfully!');
                document.getElementById('taskForm').reset();
                fetchAndDisplayTasks();
            }
        } catch (err) {
            alert('Error assigning task.');
        }
    });
}

async function loadAdminDropdownOptions() {
    const projSel = document.getElementById('taskProject');
    const userSel = document.getElementById('taskUser');

    try {
        const pRes = await fetch(`${API_URL}/projects`, { headers: { 'Authorization': `Bearer ${token}` } });
        const projects = await pRes.json();
        projSel.innerHTML = '<option value="" disabled selected>-- Select Project --</option>' + 
            projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        const uRes = await fetch(`${API_URL}/tasks/members`, { headers: { 'Authorization': `Bearer ${token}` } });
        const members = await uRes.json();
        userSel.innerHTML = '<option value="" disabled selected>-- Select Member --</option>' + 
            members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    } catch (err) {
        console.error(err);
    }
}

async function fetchAndDisplayTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } });
        globalTasksCache = await res.json();
        
        // Update stats
        document.getElementById('statTotal').innerText = globalTasksCache.length;
        document.getElementById('statPending').innerText = globalTasksCache.filter(t => t.status !== 'Completed').length;
        document.getElementById('statDone').innerText = globalTasksCache.filter(t => t.status === 'Completed').length;
        
        renderFilteredTasks();
    } catch (err) {
        document.getElementById('tasksContainer').innerHTML = '<p style="color:red; text-align:center;">Failed to load tasks.</p>';
    }
}

function renderFilteredTasks() {
    const searchVal = document.getElementById('taskSearchInput').value.toLowerCase().trim();
    const statusVal = document.getElementById('statusFilterSelector').value;
    const container = document.getElementById('tasksContainer');

    const filtered = globalTasksCache.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchVal) || (t.project_name && t.project_name.toLowerCase().includes(searchVal));
        const matchesStatus = (statusVal === 'ALL') || (t.status === statusVal);
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#64748b; text-align:center; padding:2rem;">No tasks found.</p>';
        return;
    }

    container.innerHTML = filtered.map(t => {
        const formattedDate = new Date(t.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `
            <div class="task-card ${t.status}">
                <div style="display:flex; justify-content:between; align-items:center; width:100%;">
                    <h4 style="flex:1;">${t.title}</h4>
                    <span class="badge ${t.status}">${t.status}</span>
                </div>
                <div class="task-details">
                    <div>Project: <strong>${t.project_name || 'General'}</strong></div>
                    <div>Due Date: <strong>${formattedDate}</strong></div>
                </div>
                <div style="text-align:right; font-size:0.85rem;">
                    Change Status:
                    <select onchange="updateTaskState(${t.id}, this.value)" style="padding:0.25rem; margin-left:0.5rem; border-radius:4px; border:1px solid #cbd5e1;">
                        <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
        `;
    }).join('');
}

async function updateTaskState(taskId, newStatus) {
    try {
        const res = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            fetchAndDisplayTasks();
        } else {
            alert('You cannot change status of this task.');
            fetchAndDisplayTasks();
        }
    } catch (err) {
        alert('Connection error.');
    }
}