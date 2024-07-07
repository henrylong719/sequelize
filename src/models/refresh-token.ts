import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';

export class RefreshToken extends Model {
  public token!: string;

  static associate(models: { User: ModelStatic<Model<any, any>> }) {
    RefreshToken.belongsTo(models.User, {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

export default (sequelize: Sequelize) => {
  RefreshToken.init(
    {
      token: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: 'RefreshToken',
    }
  );

  return RefreshToken;
};
