import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create an user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("should be able to create a new user", async () => {
    const mockUser: ICreateUserDTO = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }
    const user = await createUserUseCase.execute(mockUser);
    const passwordMatch = await compare(mockUser.password, user.password)

    expect(user).toHaveProperty("id");
    expect(user.name).toBe(mockUser.name);
    expect(user.email).toBe(mockUser.email);
    expect(user.password).not.toBe(mockUser.password);
    expect(passwordMatch).toBe(true);
  });

  it("should not be able to create an user with same email", async () => {

    const mockUser: ICreateUserDTO = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }
    await createUserUseCase.execute(mockUser);

    const secondMockUser: ICreateUserDTO = {
      name: "Test user 2",
      email: "test@user.com",
      password: "12345"
    }
    await expect(createUserUseCase.execute(secondMockUser)
    ).rejects.toEqual(new CreateUserError());
  })
})
