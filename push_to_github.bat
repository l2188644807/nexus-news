@echo off
chcp 65001 >nul
title 智讯枢纽 - 一键推送到 GitHub

echo ==========================================================
echo  🚀 智讯枢纽 (NEXUS PULSE) - 一键推送到 GitHub
echo ==========================================================
echo.
echo 提示：请确保您已在 GitHub (https://github.com/new) 上创建了一个空仓库。
echo.
set /p REPO_URL="请输入您的 GitHub 仓库 HTTPS 地址 (例如 https://github.com/xxx/my-news.git): "

if "%REPO_URL%"=="" (
    echo [错误] 仓库地址不能为空！
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo 正在推送到 GitHub main 分支...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==========================================================
    echo ✅ 代码推送成功！
    echo 现在可以打开 https://dashboard.render.com 选择此仓库一键部署！
    echo ==========================================================
) else (
    echo.
    echo ❌ 推送遇到问题，请检查网络或是否需要登录 GitHub。
)

pause
