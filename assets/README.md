# App Icons

Place your app icons in this directory:

- **macOS**: `icon.icns` (512x512 recommended, can be generated from PNG)
- **Windows**: `icon.ico` (256x256 recommended, multi-size .ico file)
- **Linux**: `icon.png` (512x512 recommended)

## Creating Icons

### macOS (.icns)
You can create an .icns file from a PNG using:
```bash
# Install iconutil (comes with macOS)
# Create an iconset directory structure, then:
iconutil -c icns icon.iconset
```

Or use online tools like:
- https://cloudconvert.com/png-to-icns
- https://www.icnsconverter.com/

### Windows (.ico)
Use online converters or tools like:
- https://convertio.co/png-ico/
- https://www.icoconverter.com/

### Quick Start
For now, you can use a simple PNG icon (icon.png) and Electron will use it as a fallback.
The app will work without custom icons, but will show the default Electron icon.

