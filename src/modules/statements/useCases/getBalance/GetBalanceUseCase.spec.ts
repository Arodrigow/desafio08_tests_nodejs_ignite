import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


describe("Get the account balance of a authenticated user", () => {

  let user: User;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let getBalanceUseCase: GetBalanceUseCase;
  const wrongUserId: string = "wrongID"

  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);

    const mockUser = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }

    user = await createUserUseCase.execute(mockUser);
    await authenticateUserUseCase.execute({ email: mockUser.email, password: mockUser.password })

  });

  it("should be able to get the balance", async () => {
    const balance = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(balance).toHaveProperty("balance");
  });

  it("should not be able to get balance if user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: wrongUserId });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
