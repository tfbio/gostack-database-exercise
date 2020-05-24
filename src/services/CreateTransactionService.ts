import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    categoryTitle,
  }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let categoryFound = await categoryRepository.findOne({
      where: { title: categoryTitle },
    });

    if (!categoryFound) {
      categoryFound = categoryRepository.create({ title: categoryTitle });
      await categoryRepository.save(categoryFound);
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
