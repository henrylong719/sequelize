import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import bcrypt from 'bcrypt';
import environment from '../config/environment';
import { Role } from './role';
import { RefreshToken } from './refresh-token';

export interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
}

export default (sequelize: Sequelize) => {
  class User extends Model {
    password: string | undefined;
    comparePasswords:
      | ((password: any) => Promise<Promise<boolean> & void>)
      | undefined
      | any;
    static RefreshToken: any;
    static Roles: any;

    static associate(models: {
      RefreshToken: ModelStatic<Model<any, any>>;
      Role: ModelStatic<Model<any, any>>;
    }) {
      User.RefreshToken = User.hasOne(models.RefreshToken);
      User.Roles = User.hasMany(models.Role);
    }

    static async hashPassword(password: string | Buffer) {
      return bcrypt.hash(password, environment.saltRounds);
    }

    static async createNewUser({
      email,
      password,
      roles,
      username,
      firstName,
      lastName,
      refreshToken,
    }: {
      email: string;
      password: string;
      roles: Role[];
      username: string;
      firstName?: string;
      lastName?: string;
      refreshToken?: RefreshToken;
    }) {
      return sequelize.transaction(() => {
        let rolesToSave: { role: Role }[] = [];

        if (roles && Array.isArray(roles)) {
          rolesToSave = roles.map((role) => ({ role }));
        }

        return User.create(
          {
            email,
            password,
            username,
            firstName,
            lastName,
            RefreshToken: { token: refreshToken },
            Roles: rolesToSave,
          },
          { include: [User.RefreshToken, User.Roles] }
        );
      });
    }
  }

  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Not a valid email address',
          },
          notNull: {
            msg: 'Email is required',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: true,
        validate: {
          len: {
            args: [2, 50],
            msg: 'Username must contain between 2 and 50 characters',
          },
        },
      },
      firstName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [3, 50],
            msg: 'First name must contain between 3 and 50 characters',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [3, 50],
            msg: 'Last name must contain between 3 and 50 characters',
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: { attributes: { exclude: ['password'] } },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  User.prototype.comparePasswords = async function (password: string) {
    return bcrypt.compare(password, this.password as string);
  };

  User.beforeSave(async (user, options) => {
    if (user.password) {
      const hashedPassword = await User.hashPassword(user.password);
      user.password = hashedPassword;
    }
  });

  User.afterCreate((user, options) => {
    delete user.dataValues.password;
  });

  return User;
};
