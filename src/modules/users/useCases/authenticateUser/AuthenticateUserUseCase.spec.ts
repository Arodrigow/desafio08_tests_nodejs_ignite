import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { verify } from 'jsonwebtoken';
import authConfig from '../../../../config/auth';
import { User } from "../../entities/User";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


describe("Authenticating an user", () => {

  interface IPayload {
    sub: string;
  }

  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let user: User;

  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    const mockUser = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }

    user = await createUserUseCase.execute(mockUser);
  });

  it("should be able to authenticate an existing user", async () => {


    const authUserResponse = await authenticateUserUseCase.execute({
      email: "test@user.com",
      password: "1234"
    });
    const { sub: user_id } = verify(authUserResponse.token, authConfig.jwt.secret) as IPayload;


    expect(authUserResponse).toHaveProperty("token");
    expect(authUserResponse).toHaveProperty("user");
    expect(authUserResponse.user.id).toBe(user.id);
    expect(authUserResponse.user.name).toBe(user.name);
    expect(authUserResponse.user.email).toBe(user.email);
    expect(authUserResponse.user.id).toBe(user_id);
  });

  it("should not be able to authenticate with the wrong email", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@wrong_user.com",
        password: "1234"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate with the wrong password", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@user.com",
        password: "wrong password"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
