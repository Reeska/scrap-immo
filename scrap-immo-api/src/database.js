import Sequelize from 'sequelize';

export const database = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
        ssl: process.env.DATABASE_URL.includes("ssl=true")
    }
});

database
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });