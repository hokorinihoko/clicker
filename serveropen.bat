@echo off
:: 1. バッチファイルがあるフォルダを起点に、目的の「index」フォルダまで直接移動
cd /d "%~dp0\docs"

:: 2. そのフォルダ（index）をルートにしてサーバーを裏で起動
start /b py -m http.server 8000

:: 3. サーバーの起動を2秒待つ
timeout /t 2 /nobreak >nul

:: 4. サーバーの正面（http://localhost:8000）を開く（自動的にindex.htmlが開きます）
start "" "http://localhost:8000"
