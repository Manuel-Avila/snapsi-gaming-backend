export async function handlePaginatedRequest(req, res, dataKey, modelCall) {
  const { limit, cursor } = req.query;
  const formattedLimit = parseInt(limit, 10);

  try {
    const results = await modelCall(formattedLimit, cursor);

    const nextCursor =
      results.length === formattedLimit ? results[results.length - 1].id : null;

    res.status(200).json({ [dataKey]: results, nextCursor });
  } catch (error) {
    console.error(`Error fetching ${dataKey}:`, error);
    res.status(500).json({ message: `Error fetching ${dataKey}` });
  }
}
