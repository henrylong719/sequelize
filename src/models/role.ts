import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

export class Role extends Model {
  public role!: string;

  static associate(models: { User: ModelStatic<Model<any, any>> }) {
    Role.belongsTo(models.User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  }
}

export default (sequelize: Sequelize) => {
  Role.init(
    {
      role: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Role',
    }
  );

  return Role;
};
