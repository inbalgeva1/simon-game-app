#!/bin/bash
# Install all dependencies including devDependencies for build
cd frontend && npm install --include=dev && npm run build
