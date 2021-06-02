import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";


describe("Creating a statement for an user", () => {

  let user: User;
  let statement: ICreateStatementDTO;
  let inMemoryUsersRepository: InMemoryUsersRepository;
  let inMemoryStatementsRepository: InMemoryStatementsRepository;
  let createUserUseCase: CreateUserUseCase;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createStatementUseCase: CreateStatementUseCase;

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  beforeAll(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

    const mockUser = {
      name: "Test user",
      email: "test@user.com",
      password: "1234"
    }

    user = await createUserUseCase.execute(mockUser);
    await authenticateUserUseCase.execute({ email: mockUser.email, password: mockUser.password })

  });

  beforeEach(() => {
    statement = {
      user_id: user.id as string,
      sender_id: user.id as string,
      receiver_id: user.id as string,
      amount: 100,
      description: "test description",
      type: "DEPOSIT" as OperationType
    }
  });

  it("should be able to create a statement for a logged user", async () => {

    const createdStatement = await createStatementUseCase.execute(statement);

    expect(createdStatement).toHaveProperty("id");
    expect(createdStatement.user_id).toBe(user.id);
    expect(createdStatement.description).toBe(statement.description);
    expect(createdStatement.type).toBe(statement.type);
    expect(createdStatement.amount).toBe(statement.amount);
  });

  it("should not be able to create a statement if user does not exist", async () => {
    expect(async () => {
      Object.assign(statement, { user_id: "WRONG TEST ID" });
      await createStatementUseCase.execute(statement);

    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw if amount is greater than balance", async () => {
    expect(async () => {
      Object.assign(statement, { type: "withdraw" as OperationType });
      await createStatementUseCase.execute(statement);

    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
})
