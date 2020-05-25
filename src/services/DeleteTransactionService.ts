import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const foundTransaction = await transactionsRepository.findOne({
      where: { id },
    });
    if (!foundTransaction) {
      throw new AppError('Target transaction does not exists.');
    }

    await transactionsRepository.remove(foundTransaction);
  }
}

export default DeleteTransactionService;
