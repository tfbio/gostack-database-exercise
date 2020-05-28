import { getRepository, In, getCustomRepository } from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions: CSVTransactionDTO[] = [];
    const categories: string[] = [];

    const fsReadStream = fs.createReadStream(filePath);

    const parser = csvParse({ from_line: 2 });

    const parseCSV = fsReadStream.pipe(parser);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, selfArray) => selfArray.indexOf(value) === index);

    const categoriesTobeAdded = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );
    await categoryRepository.save(categoriesTobeAdded);
    const allCategories = [...categoriesTobeAdded, ...existentCategories];

    const createdTransaction = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransaction);

    await fs.promises.unlink(filePath);
    return createdTransaction;
  }
}

export default ImportTransactionsService;
