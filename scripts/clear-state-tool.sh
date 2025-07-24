#!/bin/bash

# Clear All Persistent State Script
# This script helps clear all localStorage and session storage for EAC

echo "🧹 EAC State Management Reset"
echo "================================"
echo ""
echo "This script will help you clear all persisted state data."
echo "Use this when you want to start fresh and sync with the current database state."
echo ""

# Create a temporary HTML file that clears storage
cat > clear-state.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>EAC State Cleaner</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background: #181818;
            color: #cccccc;
        }
        .container { background: #1e1e1e; padding: 30px; border-radius: 8px; border: 1px solid #2d2d2d; }
        button { 
            background: #007acc; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 4px; 
            cursor: pointer; 
            margin: 10px 5px;
            font-size: 14px;
        }
        button:hover { background: #1e90ff; }
        .danger { background: #ff6b6b; }
        .danger:hover { background: #ff5252; }
        .success { background: #4caf50; }
        .log { 
            background: #2d2d2d; 
            padding: 15px; 
            border-radius: 4px; 
            margin: 15px 0; 
            font-family: 'Courier New', monospace; 
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        }
        .status { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .info { background: #2196F3; }
        .warning { background: #FF9800; }
        .error { background: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 EAC State Management</h1>
        <p>Use these tools to manage your application's persisted state. This is helpful when you need to sync with a fresh database or clear cached data.</p>
        
        <div class="status info">
            <strong>Current Storage Status:</strong>
            <div id="storageStatus">Checking...</div>
        </div>
        
        <h3>Quick Actions</h3>
        <button onclick="inspectStorage()">🔍 Inspect Current State</button>
        <button onclick="clearZustandStores()" class="danger">🗑️ Clear Zustand Stores</button>
        <button onclick="clearAllStorage()" class="danger">💥 Clear All Storage</button>
        <button onclick="window.location.href='http://localhost:3000'" class="success">🚀 Go to EAC Dashboard</button>
        
        <div id="log" class="log" style="display: none;"></div>
    </div>

    <script>
        function log(message) {
            const logDiv = document.getElementById('log');
            logDiv.style.display = 'block';
            logDiv.innerHTML += new Date().toLocaleTimeString() + ': ' + message + '<br>';
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function updateStorageStatus() {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
            }
            
            const statusDiv = document.getElementById('storageStatus');
            if (keys.length === 0) {
                statusDiv.innerHTML = '✅ No persisted data found';
            } else {
                statusDiv.innerHTML = `📦 Found ${keys.length} storage items: ${keys.join(', ')}`;
            }
        }
        
        function inspectStorage() {
            log('🔍 Inspecting current storage state...');
            
            log('📦 LocalStorage items:');
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(value);
                    log(`  ${key}: ${JSON.stringify(parsed, null, 2)}`);
                } catch {
                    log(`  ${key}: ${value}`);
                }
            }
            
            log('📦 SessionStorage items:');
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                log(`  ${key}: ${value}`);
            }
            
            updateStorageStatus();
        }
        
        function clearZustandStores() {
            if (!confirm('This will clear all Zustand store data. Continue?')) return;
            
            log('🧹 Clearing Zustand stores...');
            
            const storeKeys = [
                'editor-storage',
                'project-store',
                'calendar-store',
                'daily-tracker-store',
                'sidebar-store',
                'materials-store',
                'social-store',
                'terminal-store'
            ];
            
            let cleared = 0;
            storeKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    log(`  ✅ Cleared: ${key}`);
                    cleared++;
                }
            });
            
            log(`🎉 Cleared ${cleared} Zustand stores`);
            updateStorageStatus();
        }
        
        function clearAllStorage() {
            if (!confirm('This will clear ALL storage data. Continue?')) return;
            
            log('💥 Clearing all storage...');
            
            const localKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                localKeys.push(localStorage.key(i));
            }
            
            const sessionKeys = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                sessionKeys.push(sessionStorage.key(i));
            }
            
            localStorage.clear();
            sessionStorage.clear();
            
            log(`  ✅ Cleared ${localKeys.length} localStorage items`);
            log(`  ✅ Cleared ${sessionKeys.length} sessionStorage items`);
            log('🎉 All storage cleared!');
            
            updateStorageStatus();
        }
        
        // Initialize
        updateStorageStatus();
    </script>
</body>
</html>
EOF

echo "✅ Created clear-state.html"
echo ""
echo "🌐 Opening state management tool in your browser..."

# Open the HTML file in the default browser
if command -v open >/dev/null 2>&1; then
    open clear-state.html
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open clear-state.html
elif command -v start >/dev/null 2>&1; then
    start clear-state.html
else
    echo "Please open clear-state.html in your browser"
fi

echo ""
echo "📋 Usage Instructions:"
echo "1. Use 'Inspect Current State' to see what's stored"
echo "2. Use 'Clear Zustand Stores' to clear only app state"
echo "3. Use 'Clear All Storage' to clear everything"
echo "4. Go back to your EAC dashboard to see fresh data"
echo ""
echo "💡 Tip: After clearing state, refresh your EAC app to sync with the current database"
