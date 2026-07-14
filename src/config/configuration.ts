export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    pwd: process.env.DATABASE_PWD,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || '5432',
    type: process.env.DATABASE_TYPE as any,
    synchronize: true,
  },
  jwtSecretKey: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
});
