@echo off
:: First Git Bash - Run nodemon server.js in CTS-API
start "" "C:\Program Files\Git\bin\bash.exe" -c "cd /c/Users/pc/Desktop/API/CTS-API && nodemon server.js"

:: Pause for a second to ensure the first window opens before the next command
timeout 1

:: Second Git Bash - Run nodemon app.js in import-files-API
start "" "C:\Program Files\Git\bin\bash.exe" -c "cd /c/Users/pc/Desktop/API/import-files-API && nodemon app.js"

:: Pause to keep the command window open if needed
pause
