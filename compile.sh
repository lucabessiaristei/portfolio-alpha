#!/bin/bash

# Compile SCSS to CSS
sass css/style.scss css/style.css

# Compile SCSS to minified CSS
sass css/style.scss css/style.min.css --style=compressed

echo "✓ Compiled style.css and style.min.css"
