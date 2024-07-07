import TestsHelpers from '../tests-helpers';
import models from '../../src/models';

describe('User', () => {
  beforeAll(async () => {
    await TestsHelpers.startDb();
  });

  afterAll(async () => {
    await TestsHelpers.stopDb();
  });

  // drop tables before each test and then recreate new tables
  beforeEach(async () => {
    await TestsHelpers.syncDb();
  });

  describe('static methods', () => {
    describe('hashPassword', () => {
      it('should hash the password passed in the arguments', async () => {
        const { User } = models;
        const password = 'test13gb,';
        const hashedPassword = await User.hashPassword(password);
        expect(password).not.toEqual(hashedPassword);
      });
    });
    describe('createNewUser', () => {
      it('should create a new user successfully', async () => {
        const { User } = models;
        const data = {
          email: 'test@example.com',
          password: 'Test123#',
          roles: ['admin', 'customer'],
          username: 'test',
          firstName: 'Henry',
          lastName: 'Long',
          refreshToken: 'test-refresh-token',
        };
        const newUser = await User.createNewUser(data);
        const usersCount = await User.count();
        expect(usersCount).toEqual(1);
        expect(newUser.email).toEqual(data.email);
        expect(newUser.password).toBeUndefined();
        expect(newUser.username).toEqual(data.username);
        expect(newUser.firstName).toEqual(data.firstName);
        expect(newUser.lastName).toEqual(data.lastName);
        expect(newUser.RefreshToken.token).toEqual(data.refreshToken);
        expect(newUser.Roles.length).toEqual(2);
        const savedRoles = newUser.Roles.map(
          (savedRole: any) => savedRole.role
        ).sort();
        expect(savedRoles).toEqual(data.roles.sort());
      });

      it('should error if we do not pass an email', async () => {
        const { User } = models;
        const data = {
          password: 'Test123#',
        };
        let error: any;
        try {
          await User.createNewUser(data);
        } catch (err) {
          error = err;
        }
        expect(error).toBeDefined();
        expect(error.errors.length).toEqual(1);
        const errorObj = error.errors[0];
        expect(errorObj.message).toEqual('Email is required');
        expect(errorObj.path).toEqual('email');
      });

      it('should error if we create a new user with an invalid username', async () => {
        const { User } = models;
        const data = {
          email: 'test@example.com',
          password: 'Test123#',
          username: 'u',
        };
        let error: any;
        try {
          await User.createNewUser(data);
        } catch (err) {
          error = err;
        }
        expect(error).toBeDefined();
        expect(error.errors.length).toEqual(1);
        const errorObj = error.errors[0];
        expect(errorObj.message).toEqual(
          'Username must contain between 2 and 50 characters'
        );
        expect(errorObj.path).toEqual('username');
      });
    });
    describe('scopes', () => {
      let user: any;

      beforeEach(async () => {
        user = await TestsHelpers.createNewUser();
      });

      describe('defaultScope', () => {
        it('should return a user without a password', async () => {
          const { User } = models;
          const userFound = await User.findByPk(user.id);
          expect(userFound.password).toBeUndefined();
        });
      });

      describe('withPassword', () => {
        it('should return a user with the password', async () => {
          const { User } = models;
          const userFound = await User.scope('withPassword').findByPk(user.id);
          expect(userFound.password).toEqual(expect.any(String));
        });
      });
    });

    describe('instance methods', () => {
      describe('comparePasswords', () => {
        let password = 'Test123#';
        let user: any;

        beforeEach(async () => {
          user = await TestsHelpers.createNewUser({ password });
        });

        it('should return true if the password is correct', async () => {
          const { User } = models;
          const userFound = await User.scope('withPassword').findByPk(user.id);
          const isPasswordCorrect = await userFound.comparePasswords(password);
          expect(isPasswordCorrect).toEqual(true);
        });

        it('should return false if the password is incorrect', async () => {
          const { User } = models;
          const userFound = await User.scope('withPassword').findByPk(user.id);
          const isPasswordCorrect = await userFound.comparePasswords(
            'invalidpassword'
          );
          expect(isPasswordCorrect).toEqual(false);
        });
      });
    });
  });
  describe('hooks', () => {
    it('should not attempt to hash the password if it is not given', async () => {
      const user = await TestsHelpers.createNewUser();
      user.email = 'test2@example.com';
      await user.save();
    });
  });
});
