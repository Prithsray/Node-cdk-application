exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Free-Tier-safe CDK multi-stack app 👋",
      input: event,
    }),
  };
};
