type PaginationParams = {
  page: number;
  limit: number;
};

export const getPagination = ({
  page,
  limit,
}: PaginationParams) => {
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
  };
};