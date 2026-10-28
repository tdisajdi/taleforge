@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title taleforge_graphic (ComfyUI 그래픽 생성)

echo ========================================
echo  taleforge_graphic - ComfyUI 그래픽 생성 도우미
echo ========================================
echo.
echo (먼저 ComfyUI가 켜져 있는지 확인하세요 - 기존에 쓰시던 도구의 START.bat)
echo.

set "PYCMD="

py -3.11 --version >nul 2>&1
if not errorlevel 1 set "PYCMD=py -3.11"
if defined PYCMD goto :found

py -3.12 --version >nul 2>&1
if not errorlevel 1 set "PYCMD=py -3.12"
if defined PYCMD goto :found

py -3.10 --version >nul 2>&1
if not errorlevel 1 set "PYCMD=py -3.10"
if defined PYCMD goto :found

echo Python 3.10~3.12 를 찾지 못했습니다.
echo https://www.python.org/downloads/ 에서 Python 3.11 을 "Add to PATH" 체크하고 설치한 뒤
echo 이 파일을 다시 실행하세요.
pause
exit /b 1

:found
echo 사용: %PYCMD%
echo.
%PYCMD% launcher.py

echo.
pause
