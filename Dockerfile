# Use official Nginx image
FROM nginx:1.27.2-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy your HTML/CSS/JS files to the nginx html folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
