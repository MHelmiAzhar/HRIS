module.exports = {
  apps: [
    {
      name: 'hris-api', //name PM2
      script: 'dist/main.js', //llocation main.js on each project
      watch: false,
      env: {
        DB_URI: 'mongodb://localhost:27017/hris',
        JWT_SECRET:
          'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJIcmlzIiwiVXNlcm5hbWUiOiJBcmRpYW5zeWFoIiwiZXhwIjoxNzA0ODc0MjMxLCJpYXQiOjE3MDQ4NzQyMzF9.dPYUlKHOAy5OPg5G6rdiH6UMvmc4q3rWXRhr5q6kGcQ',
        JWT_EXPIRES: '8h'
      },
    },
  ],
};
