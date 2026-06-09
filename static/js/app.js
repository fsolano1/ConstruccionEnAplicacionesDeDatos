// Initialize session click states
let profileClickCount = parseInt(localStorage.getItem('api_engine_profile_clicks') || 0);
let apiCallCount = parseInt(localStorage.getItem('api_engine_api_calls') || 0);

// Decoded JWT utility
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT Decode error: ", e);
        return {};
    }
}

// Log display console helper
const logConsole = document.getElementById('logConsole');
function addLog(message, type = 'info') {
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let colorClass = 'text-on-surface-variant';
    if (type === 'success') colorClass = 'text-primary';
    if (type === 'error') colorClass = 'text-error';
    if (type === 'warn') colorClass = 'text-secondary';
    
    const logLine = document.createElement('div');
    logLine.className = `flex gap-2 ${colorClass}`;
    logLine.innerHTML = `<span class="text-on-surface-variant/40 select-none">[${timeStr}]</span> <span>${escapeHtml(message)}</span>`;
    
    if (logConsole) {
        logConsole.appendChild(logLine);
        logConsole.scrollTop = logConsole.scrollHeight;
        
        // Cap at 100 logs
        if (logConsole.childElementCount > 100) {
            logConsole.removeChild(logConsole.firstChild);
        }
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Show toast alerts
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `p-3 rounded-lg border flex items-center gap-3 text-xs font-semibold shadow-2xl pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 bg-surface-container border-outline-variant`;
    
    let icon = 'info';
    let iconColor = 'text-secondary';
    if (type === 'success') { icon = 'check_circle'; iconColor = 'text-primary'; }
    if (type === 'error') { icon = 'warning'; iconColor = 'text-error'; }
    
    toast.innerHTML = `
        <span class="material-symbols-outlined ${iconColor}">${icon}</span>
        <span class="text-on-surface">${message}</span>
    `;
    
    const container = document.getElementById('toastContainer');
    if (container) {
        container.appendChild(toast);
        
        // Trigger animation frame
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 50);
        
        // Remove after 3.5s
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

// Global Navigation setup
const sections = {
    dashboard: document.getElementById('section-dashboard'),
    keys: document.getElementById('section-keys'),
    docs: document.getElementById('section-docs'),
    logs: document.getElementById('section-logs'),
    metadata: document.getElementById('section-metadata'),
    settings: document.getElementById('section-settings'),
    support: document.getElementById('section-support')
};

function switchTab(tabName) {
    Object.values(sections).forEach(sec => {
        if (sec) {
            sec.classList.add('hidden');
            sec.classList.remove('block');
        }
    });
    
    if (sections[tabName]) {
        sections[tabName].classList.remove('hidden');
        sections[tabName].classList.add('block');
    }
    
    // Update active classes on both mobile and desktop navs
    document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('border-l-2', 'border-primary', 'bg-primary/10', 'text-primary', 'font-bold');
            btn.classList.remove('text-on-surface-variant');
        } else {
            btn.classList.remove('border-l-2', 'border-primary', 'bg-primary/10', 'text-primary', 'font-bold');
            btn.classList.add('text-on-surface-variant');
        }
    });
    
    // Redraw SVG chart if switching to dashboard
    if (tabName === 'dashboard') {
        const currentRange = document.getElementById('chartTimeRange').value;
        drawSVGChart(currentRange);
    }
    
    // Scroll logs console to bottom
    if (tabName === 'logs' && logConsole) {
        logConsole.scrollTop = logConsole.scrollHeight;
    }
    
    addLog(`Navigation: Switched view tab to '${tabName}'.`);
}

// Listen to sidebar button clicks
document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab');
        switchTab(tab);
        closeMobileSidebar();
    });
});

// Mobile Drawer Handlers
const mobileSidebar = document.getElementById('mobileSidebar');
const mobileOverlay = document.getElementById('mobileDrawerOverlay');

function openMobileSidebar() {
    if (mobileSidebar && mobileOverlay) {
        mobileSidebar.classList.remove('-translate-x-full');
        mobileOverlay.classList.remove('hidden');
    }
}
function closeMobileSidebar() {
    if (mobileSidebar && mobileOverlay) {
        mobileSidebar.classList.add('-translate-x-full');
        mobileOverlay.classList.add('hidden');
    }
}

document.getElementById('openMobileSidebarBtn').addEventListener('click', openMobileSidebar);
document.getElementById('closeMobileSidebarBtn').addEventListener('click', closeMobileSidebar);
mobileOverlay.addEventListener('click', closeMobileSidebar);

// Update Click counters display UI
function updateClickDisplays() {
    document.querySelectorAll('.auth-click-count-display').forEach(el => {
        el.innerText = profileClickCount;
    });
    document.querySelectorAll('.api-call-count-display').forEach(el => {
        el.innerText = apiCallCount;
    });
    
    // In dropdown menu
    const dropLoginCount = document.getElementById('loginClickCount');
    if (dropLoginCount) dropLoginCount.innerText = profileClickCount;
    
    const dropApiCount = document.getElementById('apiClickCount');
    if (dropApiCount) dropApiCount.innerText = apiCallCount;
    
    // In metadata session stats
    const metaLogCount = document.getElementById('metaLoginCount');
    if (metaLogCount) metaLogCount.innerText = localStorage.getItem('api_engine_login_count') || 0;
}

// Click count increment triggers
function registerAuthBtnClick() {
    profileClickCount++;
    localStorage.setItem('api_engine_profile_clicks', profileClickCount);
    updateClickDisplays();
}

// Login Modal Handlers
const loginModal = document.getElementById('loginModal');
const headerLoginBtn = document.getElementById('headerLoginBtn');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const simulateLoginBtn = document.getElementById('simulateLoginBtn');

function openLoginModal() {
    registerAuthBtnClick();
    if (loginModal) loginModal.classList.remove('hidden');
    addLog("UI Action: Open Login Modal triggered.");
}
function closeLoginModal() {
    if (loginModal) loginModal.classList.add('hidden');
}

if (headerLoginBtn) headerLoginBtn.addEventListener('click', openLoginModal);
if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', closeLoginModal);
document.getElementById('metaLoginTrigger').addEventListener('click', openLoginModal);

// Header Profile Dropdown toggles
const profileAvatarBtn = document.getElementById('profileAvatarBtn');
const profileDropdown = document.getElementById('profileDropdown');

if (profileAvatarBtn && profileDropdown) {
    profileAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        registerAuthBtnClick();
        profileDropdown.classList.toggle('hidden');
        addLog("UI Action: Profile Dropdown menu toggled.");
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        profileDropdown.classList.add('hidden');
    });
    profileDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing when clicking inside
    });
}

// Google OAuth Credential Handler (success callback)
window.handleCredentialResponse = function(response) {
    const jwt = response.credential;
    const payload = decodeJwt(jwt);
    
    localStorage.setItem('google_token', jwt);
    localStorage.setItem('user_profile', JSON.stringify(payload));
    
    // Increment login counter
    let logins = parseInt(localStorage.getItem('api_engine_login_count') || 0) + 1;
    localStorage.setItem('api_engine_login_count', logins);
    
    // Log to terminal
    addLog(`Auth: User ${payload.email} successfully logged in using Google Identity Services.`, 'success');
    
    renderAuthenticatedUI(payload);
    closeLoginModal();
    showToast("Logged in with Google!", "success");
};

// Simulated Local Login for quick testing
function handleSimulateLogin() {
    const mockClaims = {
        iss: "apiengine.simulation",
        sub: "simulated_guest_dev_1001",
        aud: "apiengine.local.origin",
        exp: Math.floor(Date.now() / 1000) + 7200,
        iat: Math.floor(Date.now() / 1000),
        name: "Developer Guest",
        email: "developer@apiengine.io",
        email_verified: true,
        picture: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80",
        locale: "es",
        hd: "apiengine.io"
    };
    
    const mockJwt = "simulatedHeader." + btoa(JSON.stringify(mockClaims)) + ".simulatedSignature";
    
    localStorage.setItem('google_token', mockJwt);
    localStorage.setItem('user_profile', JSON.stringify(mockClaims));
    
    let logins = parseInt(localStorage.getItem('api_engine_login_count') || 0) + 1;
    localStorage.setItem('api_engine_login_count', logins);
    
    addLog("Auth: Simulated local developer guest login authenticated.", "success");
    
    renderAuthenticatedUI(mockClaims);
    closeLoginModal();
    showToast("Developer Simulation Active!", "success");
}

if (simulateLoginBtn) simulateLoginBtn.addEventListener('click', handleSimulateLogin);

// Logout Handler
function logout() {
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_profile');
    
    addLog("Auth: User logged out. Clearing active credentials.", "warn");
    showToast("Signed out successfully.");
    
    renderUnauthenticatedUI();
}

document.getElementById('dropdownLogoutBtn').addEventListener('click', logout);

// UI authentication rendering state
function renderAuthenticatedUI(user) {
    // Toggle header auth elements
    if (headerLoginBtn) headerLoginBtn.classList.add('hidden');
    const headerProfile = document.getElementById('headerProfileContainer');
    if (headerProfile) headerProfile.classList.remove('hidden');
    
    // Header avatars
    const avatarImg = document.getElementById('userHeaderAvatar');
    if (avatarImg) avatarImg.src = user.picture;
    
    // Dropdown elements
    const dropAvatar = document.getElementById('dropdownAvatar');
    const dropName = document.getElementById('dropdownName');
    const dropEmail = document.getElementById('dropdownEmail');
    if (dropAvatar) dropAvatar.src = user.picture;
    if (dropName) dropName.innerText = user.name;
    if (dropEmail) dropEmail.innerText = user.email;
    
    // Update documentation console token input
    const apiTokenInput = document.getElementById('apiConsoleToken');
    const token = localStorage.getItem('google_token');
    if (apiTokenInput) apiTokenInput.value = token;
    
    // Update Session Metadata View
    const unauthMeta = document.getElementById('metadataUnauthView');
    const authMeta = document.getElementById('metadataAuthView');
    if (unauthMeta) unauthMeta.classList.add('hidden');
    if (authMeta) authMeta.classList.remove('hidden');
    
    // Set values inside session metadata card
    const metaAvatar = document.getElementById('metaUserAvatar');
    const metaName = document.getElementById('metaUserName');
    const metaEmail = document.getElementById('metaUserEmail');
    const metaClaimIss = document.getElementById('metaClaimIss');
    const metaClaimSub = document.getElementById('metaClaimSub');
    const metaClaimExp = document.getElementById('metaClaimExp');
    const metaAuthMethod = document.getElementById('metaAuthMethod');
    
    if (metaAvatar) metaAvatar.src = user.picture;
    if (metaName) metaName.innerText = user.name;
    if (metaEmail) metaEmail.innerText = user.email;
    if (metaClaimIss) metaClaimIss.innerText = user.iss || "N/A";
    if (metaClaimSub) metaClaimSub.innerText = user.sub || "N/A";
    
    if (metaClaimExp && user.exp) {
        const expDate = new Date(user.exp * 1000);
        metaClaimExp.innerText = expDate.toLocaleTimeString();
    }
    
    if (metaAuthMethod) {
        metaAuthMethod.innerText = (user.iss && user.iss.includes("google")) ? "Google OAuth 2.0" : "Dev Simulation";
    }
    
    // Pretty JSON viewer
    const jsonViewer = document.getElementById('metaJsonViewer');
    if (jsonViewer) {
        jsonViewer.innerText = JSON.stringify(user, null, 2);
    }
    
    updateClickDisplays();
}

function renderUnauthenticatedUI() {
    if (headerLoginBtn) headerLoginBtn.classList.remove('hidden');
    const headerProfile = document.getElementById('headerProfileContainer');
    if (headerProfile) headerProfile.classList.add('hidden');
    
    // Clear token input in console docs
    const apiTokenInput = document.getElementById('apiConsoleToken');
    if (apiTokenInput) apiTokenInput.value = "";
    
    // Reset metadata cards to unauthenticated states
    const unauthMeta = document.getElementById('metadataUnauthView');
    const authMeta = document.getElementById('metadataAuthView');
    if (unauthMeta) unauthMeta.classList.remove('hidden');
    if (authMeta) authMeta.classList.add('hidden');
    
    updateClickDisplays();
}

// View Metadata from Dropdown button
document.getElementById('dropdownViewMetaBtn').addEventListener('click', () => {
    switchTab('metadata');
});

// Copy JSON claims button
document.getElementById('copyMetadataJsonBtn').addEventListener('click', () => {
    const jsonViewer = document.getElementById('metaJsonViewer');
    if (jsonViewer) {
        navigator.clipboard.writeText(jsonViewer.innerText)
            .then(() => {
                addLog("System: Copied claims JSON metadata to clipboard.");
                showToast("JSON copied to clipboard!", "success");
            })
            .catch(err => {
                console.error("Failed to copy claims", err);
                showToast("Failed to copy metadata", "error");
            });
    }
});

// Check local storage session on page load
window.onload = function() {
    // Init theme
    initThemeOnLoad();
    
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
        try {
            const user = JSON.parse(savedProfile);
            renderAuthenticatedUI(user);
            addLog(`Auth: Restored session from cache for ${user.email}.`, 'success');
        } catch (err) {
            console.error("Failed to load saved session", err);
            renderUnauthenticatedUI();
        }
    } else {
        renderUnauthenticatedUI();
        addLog("System: Starting anonymous session.");
    }
    
    // Load API Keys
    renderApiKeysTable();
    
    // Load SVG Chart
    drawSVGChart("24h");
    
    // Print welcome logs
    addLog("System: Gateway Engine initializing cluster connections...");
    addLog("System: Clusters healthy, syncing data feeds.");
};

// Theme Management functions
function initThemeOnLoad() {
    const theme = localStorage.getItem('api_engine_theme') || 'dark';
    applyThemeClass(theme);
}

window.setTheme = function(theme) {
    localStorage.setItem('api_engine_theme', theme);
    applyThemeClass(theme);
    addLog(`System: Theme preferences updated to '${theme}'.`);
    showToast(`Theme changed to ${theme}!`);
}

function applyThemeClass(theme) {
    const html = document.documentElement;
    
    // Remove active outline styles
    document.getElementById('themeDarkBtn').className = 'py-3 bg-surface-container-low border border-outline-variant rounded flex flex-col items-center gap-2 text-on-surface-variant hover:text-on-surface transition-all';
    document.getElementById('themeLightBtn').className = 'py-3 bg-surface-container-low border border-outline-variant rounded flex flex-col items-center gap-2 text-on-surface-variant hover:text-on-surface transition-all';
    document.getElementById('themeSystemBtn').className = 'py-3 bg-surface-container-low border border-outline-variant rounded flex flex-col items-center gap-2 text-on-surface-variant hover:text-on-surface transition-all';
    
    let appliedTheme = theme;
    if (theme === 'system') {
        const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        appliedTheme = systemPref;
        document.getElementById('themeSystemBtn').className = 'py-3 bg-surface-container-low border-2 border-primary rounded flex flex-col items-center gap-2 text-on-surface transition-all';
    } else if (theme === 'dark') {
        document.getElementById('themeDarkBtn').className = 'py-3 bg-surface-container-low border-2 border-primary rounded flex flex-col items-center gap-2 text-on-surface transition-all';
    } else {
        document.getElementById('themeLightBtn').className = 'py-3 bg-surface-container-low border-2 border-primary rounded flex flex-col items-center gap-2 text-on-surface transition-all';
    }
    
    if (appliedTheme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

// Reset Data callback
window.resetAllSessionData = function() {
    localStorage.clear();
    addLog("System: Local cache cleared.", "error");
    showToast("Database reset successful. Reloading...", "success");
    setTimeout(() => {
        window.location.reload();
    }, 1500);
};

// API Keys Management
let keysDatabase = JSON.parse(localStorage.getItem('api_engine_keys') || '[]');

function renderApiKeysTable() {
    const tbody = document.getElementById('apiKeysTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (keysDatabase.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-6 text-center text-on-surface-variant italic">
                    No custom credentials generated yet. Create one on the left.
                </td>
            </tr>
        `;
        return;
    }
    
    keysDatabase.forEach(key => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-outline-variant/30 hover:bg-surface-variant/20 transition-colors";
        
        const badgeClass = key.status === 'Active' ? 'text-primary bg-primary/10 border-primary/20' : 'text-error bg-error/10 border-error/20';
        
        // Mask the token key: show prefix, mask body, show suffix
        const maskedToken = key.token.length > 15 
            ? `${key.token.substring(0, 10)}...${key.token.substring(key.token.length - 4)}`
            : key.token;
            
        tr.innerHTML = `
            <td class="py-3 px-4 text-on-surface font-semibold">${escapeHtml(key.name)}</td>
            <td class="py-3 px-4 text-on-surface-variant font-mono flex items-center gap-1.5">
                <span>${maskedToken}</span>
                ${key.status === 'Active' ? `
                    <button onclick="copyToClipboard('${key.token}')" class="text-primary hover:text-primary-fixed p-1 rounded hover:bg-surface-variant/30 transition-all" title="Copy Key">
                        <span class="material-symbols-outlined text-[14px] align-middle">content_copy</span>
                    </button>
                ` : ''}
            </td>
            <td class="py-3 px-4 text-on-surface-variant">${key.created}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-xs border ${badgeClass}">${key.status}</span>
            </td>
            <td class="py-3 px-4 text-right">
                ${key.status === 'Active' ? `
                    <button onclick="revokeKey('${key.id}')" class="text-xs text-error hover:underline active:scale-95 transition-all">
                        Revoke
                    </button>
                ` : `
                    <span class="text-xs text-on-surface-variant select-none">Revoked</span>
                `}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Generate Key form handler
document.getElementById('generateKeyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('keyNameInput');
    const name = input.value.trim();
    if (!name) return;
    
    // Generate random string
    const randStr = Array.from({length: 24}, () => Math.random().toString(36)[2]).join('');
    const newKey = {
        id: 'id_' + Date.now(),
        name: name,
        token: 'ak_live_' + randStr.substring(0, 16),
        created: new Date().toLocaleDateString(),
        status: 'Active'
    };
    
    keysDatabase.unshift(newKey);
    localStorage.setItem('api_engine_keys', JSON.stringify(keysDatabase));
    
    input.value = '';
    renderApiKeysTable();
    
    const maskedLogToken = newKey.token.length > 15 
        ? `${newKey.token.substring(0, 10)}...${newKey.token.substring(newKey.token.length - 4)}`
        : newKey.token;
        
    addLog(`System Credentials: Generated new key '${newKey.name}' (${maskedLogToken}).`, "success");
    showToast("API Key successfully generated!", "success");
});

// Revoke key handler
window.revokeKey = function(keyId) {
    keysDatabase = keysDatabase.map(key => {
        if (key.id === keyId) {
            key.status = 'Revoked';
            addLog(`System Credentials: Revoked access for key '${key.name}'.`, "warn");
        }
        return key;
    });
    localStorage.setItem('api_engine_keys', JSON.stringify(keysDatabase));
    renderApiKeysTable();
    showToast("API Key status changed.", "warn");
};

// Try it out API Console Executor
const apiConsoleTestBtn = document.getElementById('apiConsoleTestBtn');
const apiConsoleResponseBox = document.getElementById('apiConsoleResponseBox');
const apiConsoleResponseStatus = document.getElementById('apiConsoleResponseStatus');
const apiConsoleToken = document.getElementById('apiConsoleToken');

if (apiConsoleTestBtn) {
    apiConsoleTestBtn.addEventListener('click', async () => {
        // Track call count
        apiCallCount++;
        localStorage.setItem('api_engine_api_calls', apiCallCount);
        updateClickDisplays();
        
        // Check simulator configurations
        const simLatency = document.getElementById('toggleLatencySimulation').checked;
        const simError = document.getElementById('toggleErrorSimulation').checked;
        const customToken = apiConsoleToken.value.trim();
        
        apiConsoleResponseBox.innerText = "Connecting with Gateway REST Endpoint...";
        apiConsoleResponseStatus.innerText = "PENDING";
        apiConsoleResponseStatus.className = "font-bold text-secondary-container animate-pulse";
        
        // Delay simulation
        if (simLatency) {
            const msDelay = 300 + Math.floor(Math.random() * 500);
            addLog(`API Gateway: Adding artificial simulated delay (${msDelay}ms)...`, 'warn');
            await new Promise(resolve => setTimeout(resolve, msDelay));
        }
        
        const start = performance.now();
        
        // If forcing error simulation
        if (simError) {
            const end = performance.now();
            const latency = (end - start).toFixed(1);
            
            apiConsoleResponseStatus.innerText = "500 Internal Server Error";
            apiConsoleResponseStatus.className = "font-bold text-error";
            
            const errData = {
                error: "InternalServerException",
                message: "Simulated gateway error active. Disable this option in Settings.",
                timestamp: new Date().toISOString(),
                latency: `${latency}ms`,
                status: 500
            };
            apiConsoleResponseBox.innerHTML = `<span class="text-error">${JSON.stringify(errData, null, 2)}</span>`;
            
            addLog(`GET /api/saludo - 500 Internal Server Error (${latency}ms) - Forced simulation`, 'error');
            
            // Increment Error Rate statistics slightly on dashboard for realism
            let errVal = parseFloat(document.getElementById('statErrorRate').innerText) + 0.02;
            document.getElementById('statErrorRate').innerText = `${errVal.toFixed(2)}%`;
            
            return;
        }
        
        // Real fetch call to backend Flask application
        try {
            const headers = {};
            if (customToken) {
                headers['Authorization'] = `Bearer ${customToken}`;
            }
            
            const response = await fetch('/api/saludo', { headers });
            const end = performance.now();
            const latency = (end - start).toFixed(1);
            
            const data = await response.json();
            
            if (response.ok) {
                apiConsoleResponseStatus.innerText = `${response.status} OK`;
                apiConsoleResponseStatus.className = "font-bold text-primary";
                
                // Add latency to JSON payload output
                data.response_latency = `${latency}ms`;
                apiConsoleResponseBox.innerText = JSON.stringify(data, null, 2);
                
                addLog(`GET /api/saludo - 200 OK (${latency}ms) token=${customToken ? 'active' : 'anonymous'}`, 'success');
                
                // Increment Total request metrics on dashboard
                incrementDashboardRequests();
            } else {
                apiConsoleResponseStatus.innerText = `${response.status} Error`;
                apiConsoleResponseStatus.className = "font-bold text-error";
                apiConsoleResponseBox.innerText = JSON.stringify(data, null, 2);
                
                addLog(`GET /api/saludo - ${response.status} Error (${latency}ms)`, 'error');
            }
        } catch (err) {
            const end = performance.now();
            const latency = (end - start).toFixed(1);
            
            apiConsoleResponseStatus.innerText = "Network Error";
            apiConsoleResponseStatus.className = "font-bold text-error";
            apiConsoleResponseBox.innerText = `Network Connection Error: ${err.message}`;
            
            addLog(`GET /api/saludo - Failed to fetch (${latency}ms) error=${err.message}`, 'error');
        }
    });
}

// Incrementor for dashboard stats
function incrementDashboardRequests() {
    const reqEl = document.getElementById('statTotalRequests');
    if (reqEl) {
        let curr = parseInt(reqEl.innerText.replace(/,/g, ''));
        reqEl.innerText = (curr + 1).toLocaleString();
    }
}

// Global search filtering on Cluster environment table
const globalSearchInput = document.getElementById('globalSearchInput');
if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const tableRows = document.querySelectorAll('#clusterTable tbody tr');
        
        tableRows.forEach(row => {
            const envCell = row.cells[0].innerText.toLowerCase();
            const regionCell = row.cells[1].innerText.toLowerCase();
            const statusCell = row.cells[2].innerText.toLowerCase();
            
            if (envCell.includes(query) || regionCell.includes(query) || statusCell.includes(query)) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    });
}

// Dynamic premium SVG chart rendering
function drawSVGChart(period) {
    const container = document.getElementById('chartContainer');
    if (!container) return;
    
    container.innerHTML = ''; // Clear contents
    
    // Dynamic client dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 240;
    const padding = 25;
    
    // Generate simulated chart data points
    let numPoints = 12;
    let trafficRange = [30, 85];  // kReq/s
    let latencyRange = [38, 55];  // ms
    
    if (period === '7d') {
        numPoints = 7;
        trafficRange = [120, 310];
        latencyRange = [35, 48];
    } else if (period === '30d') {
        numPoints = 30;
        trafficRange = [350, 890];
        latencyRange = [32, 44];
    }
    
    const data = [];
    const now = Date.now();
    const interval = period === '24h' ? 2 * 60 * 60 * 1000 : period === '7d' ? 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < numPoints; i++) {
        const traffic = trafficRange[0] + Math.random() * (trafficRange[1] - trafficRange[0]);
        const latency = latencyRange[0] + Math.random() * (latencyRange[1] - latencyRange[0]);
        const time = new Date(now - (numPoints - 1 - i) * interval);
        data.push({ traffic, latency, time });
    }
    
    // Calculate coordinate positions
    const getPointsCoords = (field, minVal, maxVal) => {
        return data.map((d, index) => {
            const x = padding + (index / (numPoints - 1)) * (width - 2 * padding);
            const ratio = (d[field] - minVal) / (maxVal - minVal || 1);
            const y = height - padding - ratio * (height - 2 * padding);
            return { x, y, data: d };
        });
    };
    
    const trafficPoints = getPointsCoords('traffic', trafficRange[0] - 5, trafficRange[1] + 5);
    const latencyPoints = getPointsCoords('latency', latencyRange[0] - 2, latencyRange[1] + 2);
    
    // SVG paths generator
    const getBezierPath = (points) => {
        if (points.length === 0) return "";
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i+1];
            const cpX1 = p0.x + (p1.x - p0.x) / 3;
            const cpY1 = p0.y;
            const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
            const cpY2 = p1.y;
            path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
        }
        return path;
    };
    
    const tPath = getBezierPath(trafficPoints);
    const lPath = getBezierPath(latencyPoints);
    
    // Area closed path for traffic gradient fill
    const tFillPath = `${tPath} L ${trafficPoints[trafficPoints.length - 1].x} ${height - padding} L ${trafficPoints[0].x} ${height - padding} Z`;
    
    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("class", "overflow-visible select-none");
    
    // Definitions for gradients
    svg.innerHTML = `
        <defs>
            <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4edea3" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#4edea3" stop-opacity="0.0"/>
            </linearGradient>
            <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#adc6ff" stop-opacity="0.1"/>
                <stop offset="100%" stop-color="#adc6ff" stop-opacity="0.0"/>
            </linearGradient>
        </defs>
        
        <!-- Grid lines -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(60, 74, 66, 0.2)" stroke-dasharray="3"/>
        <line x1="${padding}" y1="${(height) / 2}" x2="${width - padding}" y2="${(height) / 2}" stroke="rgba(60, 74, 66, 0.2)" stroke-dasharray="3"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(60, 74, 66, 0.5)" />
        
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(60, 74, 66, 0.5)"/>
        
        <!-- Paths -->
        <path d="${tFillPath}" fill="url(#trafficGrad)" />
        <path d="${tPath}" fill="none" stroke="#4edea3" stroke-width="3" stroke-linecap="round" />
        <path d="${lPath}" fill="none" stroke="#adc6ff" stroke-width="2" stroke-dasharray="4" stroke-linecap="round" />
        
        <!-- Hover tracker elements (hidden by default) -->
        <line id="trackerLine" x1="0" y1="${padding}" x2="0" y2="${height - padding}" stroke="rgba(173, 198, 255, 0.3)" stroke-width="1.5" class="hidden pointer-events-none"/>
        <circle id="tAnchor" r="5" fill="#4edea3" stroke="#0b1326" stroke-width="2" class="hidden pointer-events-none"/>
        <circle id="lAnchor" r="4" fill="#adc6ff" stroke="#0b1326" stroke-width="1.5" class="hidden pointer-events-none"/>
    `;
    
    container.appendChild(svg);
    
    // Add HTML Tooltip Overlay inside chart container
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute bg-surface-container-high border border-outline-variant p-2 rounded text-[10px] text-on-surface shadow-2xl pointer-events-none hidden z-20 flex flex-col gap-1 min-w-[120px]';
    container.appendChild(tooltip);
    
    const trackerLine = svg.getElementById('trackerLine');
    const tAnchor = svg.getElementById('tAnchor');
    const lAnchor = svg.getElementById('lAnchor');
    
    // Interactive mouse movement tracker
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        // Constrain mouse X inside plotting boundaries
        if (mouseX < padding || mouseX > width - padding) {
            hideHoverTracker();
            return;
        }
        
        // Find closest coordinate point
        let closestPt = trafficPoints[0];
        let closestIndex = 0;
        let minDist = Math.abs(trafficPoints[0].x - mouseX);
        
        for (let i = 1; i < trafficPoints.length; i++) {
            const dist = Math.abs(trafficPoints[i].x - mouseX);
            if (dist < minDist) {
                minDist = dist;
                closestPt = trafficPoints[i];
                closestIndex = i;
            }
        }
        
        // Show guide lines & nodes
        if (trackerLine && tAnchor && lAnchor) {
            trackerLine.setAttribute('x1', closestPt.x);
            trackerLine.setAttribute('x2', closestPt.x);
            trackerLine.classList.remove('hidden');
            
            tAnchor.setAttribute('cx', closestPt.x);
            tAnchor.setAttribute('cy', closestPt.y);
            tAnchor.classList.remove('hidden');
            
            const latPt = latencyPoints[closestIndex];
            lAnchor.setAttribute('cx', latPt.x);
            lAnchor.setAttribute('cy', latPt.y);
            lAnchor.classList.remove('hidden');
        }
        
        // Render tooltip text
        const ptData = closestPt.data;
        const timeLabel = period === '24h' 
            ? ptData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ptData.time.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
        tooltip.innerHTML = `
            <div class="font-bold border-b border-outline-variant/30 pb-0.5 mb-0.5 text-on-surface-variant">${timeLabel}</div>
            <div class="flex items-center justify-between gap-3">
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary"></span>Traffic</span>
                <span class="font-bold font-mono text-primary">${Math.round(ptData.traffic)} req/s</span>
            </div>
            <div class="flex items-center justify-between gap-3">
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>Latency</span>
                <span class="font-bold font-mono text-secondary">${Math.round(ptData.latency)} ms</span>
            </div>
        `;
        
        tooltip.classList.remove('hidden');
        
        // Position tooltip nicely avoiding right boundary overflowing
        let tooltipX = closestPt.x + 15;
        if (tooltipX + 130 > width) {
            tooltipX = closestPt.x - 135;
        }
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${closestPt.y - 10}px`;
    });
    
    container.addEventListener('mouseleave', hideHoverTracker);
    
    function hideHoverTracker() {
        if (tooltip) tooltip.classList.add('hidden');
        if (trackerLine) trackerLine.classList.add('hidden');
        if (tAnchor) tAnchor.classList.add('hidden');
        if (lAnchor) lAnchor.classList.add('hidden');
    }
}

// Add event listener to redraw on resize
window.addEventListener('resize', () => {
    const currentRange = document.getElementById('chartTimeRange').value;
    drawSVGChart(currentRange);
});

// Chart select listener
document.getElementById('chartTimeRange').addEventListener('change', (e) => {
    drawSVGChart(e.target.value);
    addLog(`System: Redrawing charts for range filters '${e.target.value}'.`);
});

// Continuous live statistics fluctuations
setInterval(() => {
    const currentRange = document.getElementById('chartTimeRange').value;
    
    // Randomly fluctuate latency slightly (e.g. 40ms - 45ms)
    const latEl = document.getElementById('statAvgLatency');
    if (latEl) {
        const currentLat = parseInt(latEl.innerText);
        const delta = Math.random() > 0.5 ? 1 : -1;
        let nextLat = currentLat + delta;
        if (nextLat < 35) nextLat = 35;
        if (nextLat > 48) nextLat = 48;
        latEl.innerText = nextLat;
    }
    
    // Random request counts tick
    if (Math.random() > 0.3) {
        incrementDashboardRequests();
    }
}, 4500);

// Continuous random log generators
const sampleEndpoints = ['GET /api/v2/metrics', 'GET /api/v2/users', 'POST /api/v2/keys', 'GET /api/v2/projects', 'DELETE /api/v2/alerts'];
setInterval(() => {
    if (Math.random() > 0.45) {
        const randEp = sampleEndpoints[Math.floor(Math.random() * sampleEndpoints.length)];
        const status = Math.random() > 0.96 ? '500 Error' : '200 OK';
        const latency = 10 + Math.floor(Math.random() * 45);
        const ip = `192.168.1.${10 + Math.floor(Math.random() * 200)}`;
        const type = status.includes('500') ? 'error' : 'info';
        addLog(`API Gateway: Routed request ${randEp} - ${status} (${latency}ms) ip=${ip}`, type);
    }
}, 6000);

// Handle mock button clicks for placeholders
window.handleNewProjectClick = function() {
    addLog("UI Action: New Project generator triggered.");
    showToast("Project templates loading...", "info");
};
window.handleConsoleBtnClick = function(btnType) {
    addLog(`UI Action: Clicked terminal/console toggle for '${btnType}'.`);
    showToast(`Opened ${btnType} console.`);
};
window.handleViewMapClick = function() {
    addLog("UI Action: Redirecting to cluster map overlay...");
    showToast("Fetching coordinates map...");
};

// Support ticket submit
document.getElementById('supportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('supportSubject').value;
    const severity = document.getElementById('supportSeverity').value;
    const desc = document.getElementById('supportDescription').value;
    
    addLog(`Support Desk: Ticket submitted - '${subject}' Severity=[${severity.toUpperCase()}]`, 'success');
    showToast("Support ticket successfully submitted!", "success");
    
    document.getElementById('supportForm').reset();
});

// Global copy utility helper
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            addLog("System: Copied sensitive API credential/token to clipboard.");
            showToast("Copied to clipboard!", "success");
        })
        .catch(err => {
            console.error("Clipboard copy failed:", err);
            showToast("Failed to copy credential", "error");
        });
};

// Console token field visibility toggle
const toggleTokenBtn = document.getElementById('toggleConsoleTokenVisibilityBtn');
const tokenInputField = document.getElementById('apiConsoleToken');

if (toggleTokenBtn && tokenInputField) {
    toggleTokenBtn.addEventListener('click', () => {
        const iconSpan = toggleTokenBtn.querySelector('.material-symbols-outlined');
        if (tokenInputField.type === 'password') {
            tokenInputField.type = 'text';
            if (iconSpan) iconSpan.innerText = 'visibility_off';
            addLog("UI Action: Revealed API Console Token.");
        } else {
            tokenInputField.type = 'password';
            if (iconSpan) iconSpan.innerText = 'visibility';
            addLog("UI Action: Masked API Console Token.");
        }
    });
}
