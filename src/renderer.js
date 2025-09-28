class CrtyXSpeedApp {
  constructor() {
    this.currentTheme = 'blue';
    this.isDarkMode = false;
    this.isProcessing = false;
    
    this.initializeApp();
    this.setupEventListeners();
    this.loadStoredSettings();
    this.checkAdminStatus();
    this.loadLastState();
  }

  async initializeApp() {
    // Set initial theme
    document.body.className = `theme-${this.currentTheme}`;
    
    // Setup IPC listeners
    window.electronAPI.onOptimizationComplete((event, result) => {
      this.handleOptimizationResult(result);
    });
    
    window.electronAPI.onRevertComplete((event, result) => {
      this.handleRevertResult(result);
    });
  }

  setupEventListeners() {
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });

    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', () => {
      this.toggleDarkMode();
    });

    // Action buttons
    document.getElementById('optimizeBtn').addEventListener('click', () => {
      this.optimizeNetwork();
    });

    document.getElementById('revertBtn').addEventListener('click', () => {
      this.revertNetwork();
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshCurrentSettings();
    });

    // Clear output button
    document.getElementById('clearOutput').addEventListener('click', () => {
      this.clearTerminal();
    });
  }

  async loadStoredSettings() {
    try {
      const theme = await window.electronAPI.getStoredData('theme');
      const darkMode = await window.electronAPI.getStoredData('darkMode');
      
      if (theme) {
        this.setTheme(theme);
      }
      
      if (darkMode !== undefined) {
        this.isDarkMode = darkMode;
        this.updateDarkMode();
      }
    } catch (error) {
      console.error('Failed to load stored settings:', error);
    }
  }

  async checkAdminStatus() {
    try {
      const isAdmin = await window.electronAPI.isAdmin();
      const statusElement = document.getElementById('adminStatus');
      
      if (isAdmin) {
        statusElement.textContent = 'Administrator';
        statusElement.className = 'status-value admin-yes';
      } else {
        statusElement.textContent = 'Limited User';
        statusElement.className = 'status-value admin-no';
        this.showNotification('Administrator privileges required for network modifications', 'warning');
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
      document.getElementById('adminStatus').textContent = 'Unknown';
    }
  }

  async loadLastState() {
    try {
      const lastState = await window.electronAPI.getStoredData('lastState');
      const stateElement = document.getElementById('lastState');
      
      if (lastState) {
        stateElement.textContent = lastState === 'optimized' ? 'Optimized' : 'Default';
        stateElement.className = `status-value ${lastState === 'optimized' ? 'admin-yes' : 'admin-no'}`;
      } else {
        stateElement.textContent = 'Unknown';
      }
    } catch (error) {
      console.error('Failed to load last state:', error);
    }
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.body.className = `theme-${theme}`;
    
    // Update active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // Store theme preference
    window.electronAPI.setStoredData('theme', theme);
    
    this.addTerminalLine(`Theme changed to: ${theme}`, 'info');
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.updateDarkMode();
    window.electronAPI.setStoredData('darkMode', this.isDarkMode);
  }

  updateDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      toggle.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      toggle.textContent = '🌙';
    }
  }

  showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.toggle('hidden', !show);
    this.isProcessing = show;
    
    // Disable buttons during processing
    document.getElementById('optimizeBtn').disabled = show;
    document.getElementById('revertBtn').disabled = show;
    document.getElementById('refreshBtn').disabled = show;
  }

  showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const messageEl = notification.querySelector('.notification-message');
    
    // Set icon based on type
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    icon.textContent = icons[type] || icons.info;
    messageEl.textContent = message;
    
    // Set notification class
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 5000);
  }

  addTerminalLine(text, type = 'info') {
    const terminal = document.getElementById('terminal');
    
    // Split long lines to fit better
    const maxLineLength = 80;
    const timestamp = new Date().toLocaleTimeString();
    const fullText = `[${timestamp}] ${text}`;
    
    if (fullText.length > maxLineLength) {
      // Split long lines
      const lines = this.splitLongLine(fullText, maxLineLength);
      lines.forEach((lineText, index) => {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = index === 0 ? lineText : '  ' + lineText; // Indent continuation lines
        terminal.appendChild(line);
      });
    } else {
      const line = document.createElement('div');
      line.className = `terminal-line ${type}`;
      line.textContent = fullText;
      terminal.appendChild(line);
    }
    
    terminal.scrollTop = terminal.scrollHeight;
  }

  splitLongLine(text, maxLength) {
    const lines = [];
    let currentLine = '';
    const words = text.split(' ');
    
    for (const word of words) {
      if ((currentLine + word).length > maxLength) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          // Word is longer than maxLength, force break
          lines.push(word);
        }
      } else {
        currentLine += word + ' ';
      }
    }
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  }

  clearTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.innerHTML = '<div class="terminal-line info">[' + new Date().toLocaleTimeString() + '] Terminal cleared</div>';
  }

  async optimizeNetwork() {
    if (this.isProcessing) return;
    
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Optimizing network...';
    statusEl.className = 'status warning';
    
    this.showLoading(true);
    this.addTerminalLine('Starting network optimization...', 'info');
    
    try {
      const result = await window.electronAPI.optimizeNetwork();
      // Result will be handled by IPC listener
    } catch (error) {
      this.handleOptimizationResult({
        success: false,
        error: error.message,
        message: 'Failed to start optimization process'
      });
    }
  }

  async revertNetwork() {
    if (this.isProcessing) return;
    
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Reverting network settings...';
    statusEl.className = 'status warning';
    
    this.showLoading(true);
    this.addTerminalLine('Reverting network settings to defaults...', 'info');
    
    try {
      const result = await window.electronAPI.revertNetwork();
      // Result will be handled by IPC listener
    } catch (error) {
      this.handleRevertResult({
        success: false,
        error: error.message,
        message: 'Failed to start revert process'
      });
    }
  }

  async refreshCurrentSettings() {
    if (this.isProcessing) return;
    
    this.showLoading(true);
    this.addTerminalLine('Fetching current network settings...', 'info');
    
    try {
      const result = await window.electronAPI.getCurrentSettings();
      this.showLoading(false);
      
      if (result.success) {
        this.addTerminalLine('Current network settings:', 'success');
        this.addTerminalLine('', 'info');
        
        // Parse and display the output
        const lines = result.output.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          this.addTerminalLine(line.trim(), 'info');
        });
        
        this.showNotification('Current settings retrieved successfully', 'success');
      } else {
        this.addTerminalLine(`Error: ${result.error}`, 'error');
        this.showNotification('Failed to retrieve current settings', 'error');
      }
    } catch (error) {
      this.showLoading(false);
      this.addTerminalLine(`Error: ${error.message}`, 'error');
      this.showNotification('Failed to retrieve current settings', 'error');
    }
  }

  handleOptimizationResult(result) {
    this.showLoading(false);
    const statusEl = document.getElementById('status');
    
    if (result.success) {
      statusEl.textContent = 'Network optimized successfully!';
      statusEl.className = 'status success';
      
      this.addTerminalLine('Network optimization completed successfully!', 'success');
      this.addTerminalLine('', 'info');
      this.addTerminalLine('Updated network settings:', 'info');
      
      // Parse and display the output
      const lines = result.output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        this.addTerminalLine(line.trim(), 'success');
      });
      
      this.showNotification(result.message, 'success');
      this.updateLastState('optimized');
    } else {
      statusEl.textContent = 'Optimization failed!';
      statusEl.className = 'status error';
      
      this.addTerminalLine(`Optimization failed: ${result.error || result.message}`, 'error');
      this.showNotification(result.message, 'error');
    }
  }

  handleRevertResult(result) {
    this.showLoading(false);
    const statusEl = document.getElementById('status');
    
    if (result.success) {
      statusEl.textContent = 'Network settings reverted to default!';
      statusEl.className = 'status success';
      
      this.addTerminalLine('Network settings reverted to defaults successfully!', 'success');
      this.addTerminalLine('', 'info');
      this.addTerminalLine('Current network settings:', 'info');
      
      // Parse and display the output
      const lines = result.output.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        this.addTerminalLine(line.trim(), 'success');
      });
      
      this.showNotification(result.message, 'success');
      this.updateLastState('default');
    } else {
      statusEl.textContent = 'Revert failed!';
      statusEl.className = 'status error';
      
      this.addTerminalLine(`Revert failed: ${result.error || result.message}`, 'error');
      this.showNotification(result.message, 'error');
    }
  }

  updateLastState(state) {
    const stateElement = document.getElementById('lastState');
    stateElement.textContent = state === 'optimized' ? 'Optimized' : 'Default';
    stateElement.className = `status-value ${state === 'optimized' ? 'admin-yes' : 'admin-no'}`;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CrtyXSpeedApp();
});