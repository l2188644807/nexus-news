@echo off
chcp 65001 >nul
title 智讯枢纽 NEXUS PULSE - 实时资讯聚合矩阵

echo ====================================================
echo  🚀 正在启动 智讯枢纽 (NEXUS PULSE) 实时资讯系统...
echo  📡 覆盖: 每日实时新闻 ^| 实时电竞 ^| 游戏前沿 ^| 全球大事
echo ====================================================
echo.

cd /d "%~dp0"
node server.js

pause
