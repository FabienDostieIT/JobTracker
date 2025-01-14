@echo off
title JobTracker
cd backend
start cmd /k "npm run dev"
cd ../frontend
start cmd /k "npm run dev" 