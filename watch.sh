#!/bin/bash

echo "Watching css/style.scss for changes..."
echo "Press Ctrl+C to stop"

sass --watch css/style.scss:css/style.css css/style.scss:css/style.min.css --style=compressed
