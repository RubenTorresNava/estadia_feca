import { DataTypes } from 'sequelize'
import Sequelize from 'sequelize'

const Producto = Sequelize.define('Producto',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stock_actual: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
{
    tableName: 'producto',
    timestamps: false

})

export default Producto;