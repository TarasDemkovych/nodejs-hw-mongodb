import createHttpError from 'http-errors';

export const calculatePaginationData = (count, perPage, page) => {
  const totalPages = Math.ceil(count / perPage);

  if (page > totalPages && totalPages !== 0) {
    throw createHttpError(
      400,
      `Invalid page count, max available page is - ${totalPages}`,
    );
  }

  return {
    page,
    perPage,
    totalItems: count,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
