import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let categoryFound = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryFound) {
      categoryFound = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryFound);
    }
    const { income } = await transactionRepository.getBalance();
    if (type === 'outcome') {
      if (value > income) {
        throw new AppError('Insufficient balance.');
      }
    }

    const newTransaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryFound.id,
    });
    await transactionRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
