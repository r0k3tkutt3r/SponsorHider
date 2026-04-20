# SponsorHider

A Chrome extension that hides sponsored results and ads from Google Search, Google Shopping, and Amazon, with popup toggles to disable sponsor blocking or hide Google's AI Overview.

## What It Does

- **Removes sponsored results** from Google Search and Google Shopping, with a toggle to turn sponsor blocking on or off
- **Hides ads on Amazon** across multiple regional sites (US, UK, CA, DE, FR, ES, IT, JP, AU, IN, MX, BR)
- **Optional AI Overview removal** - toggle on/off to hide/show Google's AI Overview in search results

The extension automatically runs on these sites with no additional setup needed beyond installation.

## Installation

### Step 1: Enable Developer Mode in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** ON in the top-right corner

### Step 2: Load the Extension

1. Click the **Load unpacked** button that appears
2. Navigate to the SponsorHider folder and select it
3. The extension will now appear in your extensions list

### Step 3: Verify Installation

- You should see the SponsorHider icon in your Chrome toolbar
- Click the icon to open the extension popup

## Usage

### Basic Features

Simply browse Google Search, Google Shopping, or Amazon normally:
- Sponsored results are hidden automatically by default
- Ads on Amazon are removed automatically

### Toggle Sponsor Blocking

1. Click the SponsorHider extension icon in your toolbar
2. Check **"Hide sponsored results"** to block sponsored listings and ads
3. Uncheck it to allow sponsored results to appear again
4. Your preference is saved and persists across sessions

### Toggle AI Overview

1. Click the SponsorHider extension icon in your toolbar
2. Check the box labeled **"Also hide AI Overview"** to remove Google's AI Overview from search results
3. Uncheck to show AI Overview again
4. Your preference is saved and persists across sessions

## Supported Sites

- **Google Search** (www.google.com/search)
- **Google Shopping** (www.google.com/shopping, shopping.google.com)
- **Amazon Regional Sites:**
  - amazon.com (US)
  - amazon.co.uk (UK)
  - amazon.ca (Canada)
  - amazon.de (Germany)
  - amazon.fr (France)
  - amazon.es (Spain)
  - amazon.it (Italy)
  - amazon.co.jp (Japan)
  - amazon.com.au (Australia)
  - amazon.in (India)
  - amazon.com.mx (Mexico)
  - amazon.com.br (Brazil)

## Technical Details

- **Manifest Version**: 3 (modern Chrome extension format)
- **Permissions**: Storage only (no tracking, no browsing data access)
- **Data Storage**: Sponsor blocking and AI Overview preferences are stored locally using Chrome's sync storage

## Troubleshooting

**Extension not hiding results?**
- Refresh the page after installation
- Make sure you're on a supported site
- Check that the extension is enabled in `chrome://extensions/`

**AI Overview toggle not working?**
- Perform a new Google search after toggling the option
- Refresh the page if needed

**Extension disappeared from toolbar?**
- Check `chrome://extensions/` to see if it's still installed
- Reload the extension if needed

## Privacy

This extension:
- ✅ Does not collect any personal data
- ✅ Does not track your browsing
- ✅ Only stores your sponsor blocking and AI Overview preferences locally
- ✅ Requires no accounts or sign-ups

## Development

To modify or contribute to this extension:

1. Make changes to the relevant files
2. In `chrome://extensions/`, click the refresh icon next to SponsorHider
3. Test your changes on the supported sites

### File Structure

- `manifest.json` - Extension configuration
- `content.js` - Main script that hides ads and sponsored results
- `popup.html` - Extension popup UI
- `popup.js` - Popup functionality and settings
- `popup.css` - Popup styling
- `styles.css` - Content script CSS selectors for hiding sponsored elements

## License

This project is open source and available under the MIT License.
