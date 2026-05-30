// utils/buildTransactionOrder.ts

type TransactionOrder = {
  sortBy:
    | 'amount'
    | 'category'
    | 'date'
    | 'createdAt'
    | 'updatedAt';

  order:'asc'|'desc';
};

export const buildTransactionOrder = ({
  sortBy,
  order,
}:TransactionOrder)=>{

  return {
    [sortBy]:order,
  };
};