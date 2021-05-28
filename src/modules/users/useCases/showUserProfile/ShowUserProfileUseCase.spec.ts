import { User } from "../../entities/User"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { IAuthenticateUserResponseDTO } from "../authenticateUser/IAuthenticateUserResponseDTO";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show user profile if autheticated", () => {
  let user: User;
  let userNotLogged: User;
  let userSession: IAuthenticateUserResponseDTO;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let showUserProfileUseCase: ShowUserProfileUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;

  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);

    const mockUser = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }

    user = await createUserUseCase.execute(mockUser);
    userSession = await authenticateUserUseCase.execute({ email: mockUser.email, password: mockUser.password })

  });

  it("should be able to show user profile if autheticated", async () => {
    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile.name).toBe(user.name);
    expect(userProfile.email).toBe(user.email);
    expect(userProfile.id).toBe(user.id);
  });

  it("should not be able to show user profile if user doesn't exist", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("iderrado");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
})
