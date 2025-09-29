# CrtyXSpeed - Network Optimization Tool
<img width="1024" height="1024" alt="logo" src="https://github.com/user-attachments/assets/c65cff95-9077-4a52-ab99-1772e06b976d" />

A modern Electron desktop application for Windows network optimization using netsh commands.

## Features

- **Network Optimization**: Apply performance-focused TCP settings
- **Easy Revert**: Restore default network settings with one click
- **Modern UI**: Dark/light mode with multiple color themes
- **System Tray**: Quick access to optimize/revert functions
- **Admin Detection**: Automatically detects administrator privileges
- **Real-time Output**: View netsh command results in a terminal-style interface
- **Persistent Settings**: Remembers your theme preferences and last applied state

## Network Optimizations Applied

When you click "Optimize Network", the following netsh commands are executed:

```cmd
netsh int tcp set global rss=enabled
netsh int tcp set global autotuninglevel=restricted
netsh int tcp set global ecncapability=disabled
netsh int tcp set global timestamps=disabled
netsh int tcp set global rsc=disabled
```

## Installation & Setup

1. **Prerequisites**:
   - Node.js (v16 or higher)
   - Windows operating system
   - Administrator privileges (required for netsh commands)

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

4. **Build Application**:
   ```bash
   npm run build
   ```

5. **Package for Distribution**:
   ```bash
   npm run pack
   ```

## Usage

1. **Launch the Application**: Run as administrator for full functionality
2. **Choose Your Theme**: Select from Black, White, Blue, Green, or Orange themes
3. **Toggle Dark/Light Mode**: Use the moon/sun icon in the header
4. **Optimize Network**: Click the "Optimize Network" button to apply performance settings
5. **View Results**: Check the terminal output for detailed netsh command results
6. **Revert Changes**: Use "Revert to Defaults" to restore original settings
7. **System Tray**: Minimize to tray for quick access to optimization functions

## System Tray Features

- **Show CrtyXSpeed**: Restore the main window
- **Quick Optimize**: Apply network optimizations without opening the main window
- **Quick Revert**: Restore defaults without opening the main window
- **Quit**: Exit the application

## Themes

Choose from 5 color themes:
- **Black**: Sleek dark theme
- **White**: Clean light theme  
- **Blue**: Professional blue gradient
- **Green**: Nature-inspired green
- **Orange**: Energetic orange theme

## Technical Details

- **Framework**: Electron with vanilla JavaScript
- **UI**: Modern CSS with gradient backgrounds and smooth animations
- **Storage**: Electron Store for persistent settings
- **Security**: Context isolation enabled, no node integration in renderer
- **Admin Detection**: Automatic UAC privilege checking

## File Structure

```
src/
├── main.js          # Main Electron process
├── preload.js       # Secure IPC bridge
├── renderer.js      # Frontend application logic
├── index.html       # Main UI structure
├── styles.css       # Complete styling and themes
└── assets/          # Icons and images (add your own)
```

## Building for Production

The app is configured to request administrator privileges automatically when installed. The build process creates an NSIS installer for Windows.

## Security Notes

- The application requires administrator privileges to modify network settings
- All netsh commands are executed in a controlled manner
- The app includes proper error handling and user feedback
- Context isolation is enabled for security

## Troubleshooting

**"Administrator Rights Required" Warning**:
- Right-click the application and select "Run as administrator"
- Or install the built version which automatically requests admin privileges

**Commands Not Working**:
- Ensure you're running on Windows
- Verify administrator privileges are granted
- Check Windows version compatibility (Windows 7+ recommended)

**UI Issues**:
- Try different themes if colors appear incorrect
- Toggle dark/light mode for better visibility
- Resize the window if layout appears cramped

## License

MIT License - Feel free to modify and distribute as needed.
