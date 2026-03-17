# PhishShield AI Backend Instructions

To run this backend, you MUST have Python installed on your Windows machine.

### Prerequisites: Python Installation
If you do not have Python installed, or if you get a "Python was not found" error in your terminal, follow these steps:

1. Go to https://www.python.org/downloads/windows/
2. Download the latest Python installer for Windows.
3. Open the downloaded installer file.
4. **CRITICAL:** At the very bottom of the first setup screen, check the box that says **"Add python.exe to PATH"**.
5. Click **"Install Now"**.
6. Restart your Visual Studio Code completely so it recognizes the new `python` and `pip` commands.

### Running the Server
Once Python is installed and added to your PATH, open a terminal in this `backend` folder and run:

1. Install backend dependencies:
`pip install -r requirements.txt`

2. Start the AI Server:
`uvicorn main:app --reload`
