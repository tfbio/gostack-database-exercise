import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class CreateTransactionService {
  public async execute(): Promise<Transaction> {
    const TransactionRepository = getCustomRepository(Transaction);
  }
}

export default CreateTransactionService;
