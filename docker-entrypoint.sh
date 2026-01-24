#!/bin/sh

# Replace env vars in JavaScript files
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL}|g" "$file"
  fi
done

# Start nginx
exec nginx -g 'daemon off;'
