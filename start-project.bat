@echo off
REM start-project.bat - Windows helper script to start TaskFlow from any project directory

echo Starting TaskFlow Memory Server with current directory memory bank...
node "%~dp0start-from-project.js" %*
